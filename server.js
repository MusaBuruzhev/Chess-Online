const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];
let currentFEN = 'start';

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('Игрок подключился:', socket.id);

  if (players.length < 2) {
    players.push(socket.id);
    const color = players.length === 1 ? 'white' : 'black';
    socket.emit('playerColor', color);
  } else {
    socket.emit('roomFull');
    return;
  }

  socket.emit('fenUpdate', currentFEN);

  socket.on('move', (fen) => {
    currentFEN = fen;
    socket.broadcast.emit('fenUpdate', fen);
  });

  socket.on('disconnect', () => {
    players = players.filter(id => id !== socket.id);
    console.log('Игрок отключился:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
