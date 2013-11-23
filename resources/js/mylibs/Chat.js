var Chat = (function (window, document, $, undefined) {
    var messages = [];
    var username = "";
    var WINDOW_ID = "chat_window";
    var MESSAGE_INPUT_ID = "message";

    var bindEvents = function () {
        $('#chat_input button').click(function () {
            sendMessage();
        });
        $('#code_input_wrapper button').click(function () {
            sendCode();
        });
        $('#message').keyup(function (key) {
            if (key.which == 13) {
                sendMessage();
            }
        });
    }

    var sendMessage = function () {
        var chatMessage = $('#message').val();
        var message = new Message(username, "message", chatMessage);
        if (message.validateMessage()) {
            messages.push(message);
            ChatSocket.sendMessage(message);
        }
        $('#message').val('');
    }

    var sendCode = function () {
        var code = myCodeMirror.getValue();
        var message = new Message(username, "code", code);
        if (message.validateMessage()) {
            messages.push(message);
            ChatSocket.sendMessage(message);
        }
        myCodeMirror.setValue('');
    }

    return {

        newMessage: function (data) {
            var message = new Message(data.username, data.type, data.message, data.id);
            if (message.validateMessage()) {
                messages.push(message);
                message.appendNewMessage();
                // Scroll chat window down so message is visible
                $('#chat_window').scrollTop($('#chat_window').prop("scrollHeight"));
            } else {
                console.log("There was an error: " + data);
            }
        },

        initializeChat: function (user) {
            username = user;
            bindEvents();
        }

    }
})(window, document, jQuery, undefined);