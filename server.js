const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const players = {};

// Обслуживание статических файлов из папки public
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);

    // Добавляем нового игрока
    players[socket.id] = { x: 0, y: 0 };

    // Отправляем всем клиентам обновленный список игроков
    io.emit('updatePlayers', players);

    // Обработка отключения игрока
    socket.on('disconnect', () => {
        console.log('user disconnected: ' + socket.id);
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });

    // Обработка обновления позиции игрока
    socket.on('updatePosition', (position) => {
        if (players[socket.id]) {
            players[socket.id].x = position.x;
            players[socket.id].y = position.y;
            io.emit('updatePlayers', players);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
