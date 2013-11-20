var express = require("express");
var app = express();
var port = 3700;

var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'Welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});
