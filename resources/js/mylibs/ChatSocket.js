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
            message.room_id = ROOM_ID;
            socket.emit('chat:send', message);
        },

        sendEnter: function(data) {
            data.room_id = ROOM_ID;
            socket.emit('user:enter', data);
        },

        sendLeave: function(username) {
            socket.emit('user:leave', {"username":username, "room_id":ROOM_ID});
        },

        startSockets: function () {
            socket = io.connect(SOCKET_URL);
            socket.on('chat:receive', function (data) {
                receiveMessage(data);
            });

            socket.on('chat:history', function (data) {
                $.each(data, function(i, message){
					receiveMessage(message);
				});
            });

            socket.on('user:list', function(data) {
                receiveUserList(data);
            });
        }
    }
})(window, document, jQuery, undefined);
