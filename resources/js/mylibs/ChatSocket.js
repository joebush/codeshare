var ChatSocket = (function (window, document, $, undefined) {
    var SOCKET_URL = 'http://localhost:3700';
    var socket;

    var receiveMessage = function (data) {
        Chat.newMessage(data);
    }
    
    var receiveUserList = function (data) {
           User.newUserList(data);
    }

    return {
        sendMessage: function (message) {
            socket.emit('send', message);
        },
        
        sendEnter: function(data) {
            socket.emit('enter', data);  
        },
        
        sendLeave: function(username) {
            socket.emit('leave', {"username":username});
        },
        
        startSockets: function () {
            socket = io.connect(SOCKET_URL);
            socket.on('message', function (data) {
                receiveMessage(data);
            });
            socket.on('userlist', function(data) {
                receiveUserList(data);
            });
        }
    }
})(window, document, jQuery, undefined);