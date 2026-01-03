const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set();

console.log('💬 Chat server running on port 8080');

wss.on('connection', (ws) => {
  console.log('✅ New user connected');
  clients.add(ws);
  
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Welcome to customer support! How can we help you?',
    user: 'System'
  }));
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📨 Received:', message);
      
      // Broadcast to all connected clients
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'chat',
            message: message.text,
            user: message.user,
            time: new Date().toLocaleTimeString()
          }));
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('❌ User disconnected');
    clients.delete(ws);
  });
});