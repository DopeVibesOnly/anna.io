
// Устанавливаем зависимости
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Создаем приложение Express
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Подключаем статические файлы (например, клиентские файлы HTML, CSS, JS)
app.use(express.static(__dirname + '/public'));

// При подключении нового пользователя
io.on('connection', (socket) => {
    console.log('Новый пользователь подключился');

    // Слушаем сообщения от клиента
    socket.on('chat message', (data) => {
        console.log('Сообщение: ', data);

        // Рассылаем сообщение всем подключенным клиентам
        io.emit('chat message', data);
    });

    // При отключении пользователя
    socket.on('disconnect', () => {
        console.log('Пользователь отключился');
    });
});

// Запускаем сервер на порту 3000
server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});
