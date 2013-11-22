var ChatSocket = (function (window, document, $, undefined) {
    var SOCKET_URL = document.location.origin;
    var socket;

    var receiveMessage = function (data) {
        Chat.newMessage(data);
    }

    var receiveUserList = function (data) {
           User.newUserList(data);
    }

    return {
        sendMessage: function (message) {
            socket.emit('chat:send', message);
        },

        sendEnter: function(data) {
            data.room_id = ROOM_ID;
            socket.emit('user:enter', data);
        },

        startSockets: function () {
            socket = io.connect(SOCKET_URL);
            socket.on('chat:receive', function (data) {
                receiveMessage(data);
                // Scroll chat window down so message is visible
                $('#chat_window').scrollTop($('#chat_window').prop("scrollHeight"));
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
