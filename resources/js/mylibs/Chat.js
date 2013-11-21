var Chat = (function (window, document, $, undefined) {
    var messages = [];
    var username = "";
    var WINDOW_ID = "chat_window";
    var MESSAGE_INPUT_ID = "message";

    var bindEvents = function () {
        $('#chat_input button').click(function () {
            sendMessage();
        });
    }

    var createMessageHTML = function (message) {
        // Loop through messages and create HTML template
        return "<div class='chat'><p class='user'>" + message.username + " has sent a message</p><p class='time'>" + message.time + "</p><p class='chat_message'>" + message.message + "</p></div>";
    }

    var displayNewMessage = function (html) {
        $('#chat_window').append(html);
    }

    var validateMessage = function (message) {
        return message.message && message.username && (message.type === "code" || message.type === "message");
    }

    var sendMessage = function () {
        var chatMessage = $('#message').val();
        var message = new Message(username, "message", chatMessage);
        if (validateMessage(message)) {
            messages.push(message);
            ChatSocket.sendMessage(message);
        }
        $('#message').val('');
    }


    return {
        newMessage: function (data) {
            var message = new Message(data.username, data.type, data.message);
            if (validateMessage(message)) {
                messages.push(message);
                var html = createMessageHTML(message);
                displayNewMessage(html);
            } else {
                console.log("There was an error: " + data);
            }
        },

        initializeChat: function (user) {
            username = user;
            ChatSocket.startSockets();
            bindEvents();
        }

    }
})(window, document, jQuery, undefined);