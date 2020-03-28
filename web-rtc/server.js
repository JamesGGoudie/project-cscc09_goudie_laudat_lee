const { PeerServer } = require('peer');
const ps = PeerServer({
    port: 9000,
    path: '/peer',
    key: 'architect',
    proxied: true});

ps.on('connection', (client) => {
  console.log(`Connected to: ${client.id}`);
});

ps.on('disconnect', (client) => {
  console.log(`Disconnected from: ${client.id}`);
});

console.log('Help me Obi Wan Kenobi, you are my only hope.');
