# Zustand Persist 数据迁移问题与解决方案

## 问题描述

在使用 Zustand 的 `persist` 中间件时，当我们为现有类型添加新字段后，从 localStorage 恢复的旧数据不包含新字段，导致运行时错误。

### 具体案例

**类型定义**：
```typescript
type Mission = {
    MissionId: string,
    WorkSpaceId: string,
    title: string,
    Notes: Note[], // 新添加的字段
}
```

**错误场景**：
```typescript
// 旧数据（localStorage 中）：{ MissionId: "123", WorkSpaceId: "456", title: "Task" }
// 缺少 Notes 字段

// 代码尝试操作 Notes
[...state.missions[missionId].Notes, newNote]
// → TypeError: state.missions[missionId].Notes is not iterable
```

## 临时解决方案：空值兜底

在所有操作新字段的地方添加 `?? []` 兜底：

```typescript
addNotesToMission: (missionId, newNote) => {
    set((state) => ({
        missions: {
            ...state.missions,
            [missionId]: {
                ...state.missions[missionId],
                Notes: [...(state.missions[missionId].Notes ?? []), newNote]
            }
        }
    }));
},
```

**优点**：简单快速，立即生效
**缺点**：需要在每个使用新字段的地方都加防御代码，容易遗漏

## 更好的解决方案

### 1. 数据迁移函数（推荐）

使用 `persist` 的 `migrate` 选项自动升级旧数据：

```typescript
export const useWorkSpace = create<WorkSpaceProps>()(
    persist(
        (set, get) => ({
            // ... 状态和方法
        }),
        {
            name: 'workspace-storage',
            version: 1, // 版本号
            migrate: (persistedState: any, version: number) => {
                if (version === 0) {
                    // 从版本 0 升级到版本 1：为所有 mission 添加 Notes 字段
                    if (persistedState.missions) {
                        Object.keys(persistedState.missions).forEach(missionId => {
                            if (!persistedState.missions[missionId].Notes) {
                                persistedState.missions[missionId].Notes = [];
                            }
                        });
                    }
                }
                return persistedState;
            }
        }
    )
);
```

### 2. 类型安全的默认值工厂

创建工厂函数确保对象完整性：

```typescript
const createMissionWithDefaults = (partial: Partial<Mission>): Mission => ({
    MissionId: '',
    WorkSpaceId: '',
    title: '',
    Notes: [], // 默认值
    ...partial,
});

// 使用时
createMission: (mission) => {
    const completeMission = createMissionWithDefaults(mission);
    set((state) => ({ 
        missions: { ...state.missions, [completeMission.MissionId]: completeMission } 
    }));
},
```

### 3. 状态初始化检查

在 store 初始化时检查并修复数据：

```typescript
export const useWorkSpace = create<WorkSpaceProps>()(
    persist(
        (set, get) => ({
            // 初始化方法
            initializeStore: () => {
                const state = get();
                const updatedMissions = { ...state.missions };
                let needsUpdate = false;

                Object.keys(updatedMissions).forEach(missionId => {
                    if (!updatedMissions[missionId].Notes) {
                        updatedMissions[missionId] = {
                            ...updatedMissions[missionId],
                            Notes: []
                        };
                        needsUpdate = true;
                    }
                });

                if (needsUpdate) {
                    set({ missions: updatedMissions });
                }
            },
            // ... 其他方法
        }),
        { name: 'workspace-storage' }
    )
);
```

### 4. 版本化 Schema

使用版本化的数据结构：

```typescript
interface DataSchema {
    version: number;
    data: {
        missions: Record<string, Mission>;
        // ... 其他字段
    };
}

const CURRENT_VERSION = 2;

const migrateData = (schema: DataSchema): DataSchema => {
    if (schema.version < 2) {
        // 升级到版本 2：添加 Notes 字段
        Object.values(schema.data.missions).forEach(mission => {
            if (!mission.Notes) {
                mission.Notes = [];
            }
        });
        schema.version = 2;
    }
    return schema;
};
```

## 最佳实践建议

1. **版本控制**：为 persist 配置添加 `version` 和 `migrate`
2. **渐进式迁移**：每次只升级一个版本，便于调试
3. **类型安全**：使用 TypeScript 的 `Required<T>` 确保必填字段
4. **测试覆盖**：为迁移逻辑编写单元测试
5. **向后兼容**：保持旧版本数据的读取能力

## 总结

虽然 `?? []` 兜底是快速修复方案，但**数据迁移函数**是处理 persist 数据结构变更的最佳实践。它能：

- 一次性解决所有兼容性问题
- 保持代码整洁，无需到处添加防御代码  
- 提供版本管理能力
- 支持复杂的数据转换逻辑

建议在项目中尽早引入数据迁移机制，避免技术债务积累。