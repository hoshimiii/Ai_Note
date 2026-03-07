fetch('https://api.siliconflow.cn/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'Pro/zai-org/GLM-4.7',
    messages: [
      {role: 'system', content: '你是一个有用的助手'},
      {role: 'user', content: '你好，请介绍一下你自己'}
    ],
    "stream": true,
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));