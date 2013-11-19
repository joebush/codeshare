<!DOCTYPE html>
<html>
<head>
	<title>CodeShare - Start chatting!</title>
	<link href="resources/css/style.css" type="text/css" rel="stylesheet" />
</head>
<body>
	<h1>Chat Page</h1>

	<div id="chat-box" style="display: block; width: 600px; height: 400px; overflow-y: scroll; border: 1px solid gray; margin-bottom: 10px;">
	</div>
	<textarea id="chat-message" style="width: 600px; height: 75px; border: 1px solid gray;"></textarea>
	<button id="send-message">Send</button>

	<script src="node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.min.js"></script>
	<script src="resources/js/jquery-1.10.2.min.js"></script>
	<script>
	var SOCKET_URL = 'http://localhost:3700';

	$(function(){
		var messages = [];
		var socket = io.connect(SOCKET_URL);

		// Message received handler
		socket.on('message', function (data) {
			if(data.message) {
				messages.push(data.message);

				// Loop through messages and create HTML template
				var html = '';
				for(var i=0; i < messages.length; i++) {
					html += messages[i] + '<br />';
				}
				$('#chat-box').html(html);

			} else {
				console.log("There is a problem:", data);
			}
		});

		// Message send handler
		$('#send-message').on('click', function() {
			var chatMessage = $('#chat-message').val();
			socket.emit('send', { message: chatMessage });
			$('#chat-message').val('');
		});
	});
	</script>
</body>
</html>
