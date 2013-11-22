var SOCKET_URL = 'http://localhost:3700';

$(function () {
    var messages = [];
    var socket = io.connect(SOCKET_URL);

	// Join room
	socket.emit('user:join', {
		room_id: ROOM_ID,
		username: 'Jordan'
	});

    // Message received handler
    socket.on('chat:receive', function (data) {
        if (data.message) {
            messages.push(data);

            // Build message template
            var html = "<div class='chat'>"+
				"<p class='user'>Matt Sessions has sent a message</p>"+
				"<p class='time'>10:10:30 PM</p>"+
				"<p class='chat_message'>" + data.message + "</p>"+
				"</div>";
            $('#chat_window').append(html);

        } else {
            console.log("There is a problem:", data);
        }
    });

    socket.on('chat:history', function (data) {
        if (data) {
            messages = data;
            var html = '';

            // Build message template
            $.each(data, function(index, obj){
				html += "<div class='chat'>"+
					"<p class='user'>"+ obj.username +" has sent a message</p>"+
					"<p class='time'>"+ obj.date_created +"</p>"+
					"<p class='chat_message'>" + obj.message + "</p>"+
					"</div>";
			});
            $('#chat_window').html(html);

        } else {
            console.log("There is a problem:", data);
        }
    });

    // Message send handler
    $('#chat_input button').click(function () {
        var chatMessage = $('#message').val();
        socket.emit('chat:send', {
            room_id: ROOM_ID,
            message: chatMessage,
            username: 'Jordan',
            type: 'message'
        });
        $('#message').val('');
    });
});
