var User = (function (window, document, $, undefined) {

    var username;

    var bindEvents = function () {
        $('#username_wrapper button').click(function () {
            logUserIn();
        });
        $('#username_input').keyup(function (key) {
            if (key.which == 13) {
                logUserIn();
            }
        });
    }

    var logUserIn = function () {
        username = $('#username_input').val();
        var password = $('#password_input').val();
        if (validateUsername()) {
            ChatSocket.sendEnter({
                "username": username,
                "password": password
            });
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

    var bindNewRoomEvents = function () {
        $('#create_private_button').click(function () {
            sendCreatePrivate();
        });
        $('#create_public_button').click(function () {
            $('#password_inner_wrapper').hide();
            $('#myModal').modal('hide');
        });
    }

    var sendCreatePrivate = function () {
        var password = $('#new_room_password').val();
        if (password == "" || password == null) {
            showEnterError();
        } else {
            ChatSocket.sendCreatePrivate(password);
            $('#myModal').modal('hide');
        }
    }

    var displayLoginError = function () {
        $('#create_private_button').removeClass('btn-primary').addClass('btn-warning');
    }

    $(document).ready(function () {
        if (NEW_ROOM) {
            $('#myModal').modal({
                backdrop: "static"
            });
            bindNewRoomEvents();
        }
        if (!PASSWORD_PROTECTED) {
            $('#password_inner_wrapper').hide();
        }
        bindEvents();
        ChatSocket.startSockets();
    });

    return {

        newUserList: function (data) {
            updateUserList(data.usernames);
        },

        loginResponse: function (data) {
            if (data.response) {
                $('#welcome_screen').fadeOut(500, function () {
                    $(this).remove();
                });
                Chat.initializeChat(username);
            } else {
                showEnterError();
            }
        }
    }

})(window, document, jQuery, undefined);