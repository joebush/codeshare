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
    }

    var createMessageHTML = function (message) {
        return "<div class='chat'><p class='user'>" + message.username + " has sent a message</p><p class='time'>" + message.time + "</p><p class='chat_message'>" + message.message + "</p></div>";
    }

    var createCodeHTML = function (message) {
        var html = "<div class='chat code'><p class='user'>" + message.username + " has sent code</p>";
        html += "<p class='time'>" + message.time + "</p>";
        html += "<p class='code_message'><button class='btn btn-primary'><i class='glyphicon glyphicon-cloud-download'></i><br>Download Code</button><button class='btn btn-primary'><i class='glyphicon glyphicon-indent-left'></i><br>Edit Code</button></p></div>";
        return html;
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

    var sendCode = function () {
        var code = $('.CodeMirror textarea').val();
        var message = new Message(username, "code", code);
        if (validateMessage(message)) {
            messages.push(message);
            ChatSocket.sendMessage(JSON.stringify(message));
        }
        $('.CodeMirror textarea').val('');
    }

    return {

        newMessage: function (data) {
            var message = new Message(data.username, data.type, data.message);
            if (validateMessage(message)) {
                messages.push(message);
                var html = '';
                if (message.type === "code") {
                    html = createCodeHTML(message);
                } else {
                    html = createMessageHTML(message);
                }
                displayNewMessage(html);
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
