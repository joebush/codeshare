var ChatSocket = (function (window, document, $, undefined) {
    var SOCKET_URL = 'http://localhost:3700';
    var socket;

    var receiveMessage = function (data) {
        Chat.newMessage(data);
    }

    return {
        sendMessage: function (message) {
            socket.emit('send', message);
        },
        
        startSockets: function () {
            socket = io.connect(SOCKET_URL);
            socket.on('message', function (data) {
                receiveMessage(data);
            });
        }
    }
})(window, document, jQuery, undefined);