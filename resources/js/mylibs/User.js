var User = (function (window, document, $, undefined) {

    var username;

    var bindEvents = function () {
        $('#username_wrapper button').click(function () {
            logUserIn();
        });
        $('#leave_chat').click(function () {
            logUserOut();
        });
    }

    var logUserIn = function () {
        username = $('#username_input').val();

        if (validateUsername()) {
            ChatSocket.sendEnter({
                "username": username
            });
            $('#welcome_screen').fadeOut(500, function () {
                $(this).remove();
            });
            Chat.initializeChat(username);
        } else {
            showEnterError();
        }
    }

    var logUserOut = function () {
        ChatSocket.sendLeave(username);
        $('body').html('');
    }

    var validateUsername = function () {
        return (username != "" && username != null);
    }

    var showEnterError = function () {
        $('#username_wrapper button').removeClass('btn-primary').addClass('btn-danger');
    }

    var updateUserList = function (users) {
        html = "";
        for (var i = 0, len = users.length; i < len; i++) {
            html += "<div class='user_entry'><p>" + users[i] + "</p></div>";
        }
        $('#user_list').html(html);
    }

    $(document).ready(function () {
        bindEvents();
        ChatSocket.startSockets();
    });

    return {

        newUserList: function (data) {
            updateUserList(data.usernames);
        }
    }

})(window, document, jQuery, undefined);