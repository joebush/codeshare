var SOCKET_URL = 'http://localhost:3700';

$(function () {
    var messages = [];
    var socket = io.connect(SOCKET_URL);

    // Message received handler
    socket.on('message', function (data) {
        if (data.message) {
            messages.push(data.message);

            // Loop through messages and create HTML template
            var html = '';
            for (var i = 0; i < messages.length; i++) {
                html += "<div class='chat'><p class='user'>Matt Sessions has sent a message</p><p class='time'>10:10:30 PM</p><p class='chat_message'>" + messages[i] + "</p></div>";
            }
            $('#chat_window').append(html);

        } else {
            console.log("There is a problem:", data);
        }
    });

    // Message send handler
    $('#chat_input button').click(function () {
        var chatMessage = $('#message').val();
        socket.emit('send', {
            message: chatMessage
        });
        $('#message').val('');
    });
});