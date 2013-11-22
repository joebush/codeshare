var Login = (function (window, document, $, undefined) {

    var bindEvents = function () {
        $('#username_wrapper button').click(function () {
            logUserIn();
        });
    }

    var logUserIn = function () {
        var user = $('#username_input').val();

        if (validateUsername(user)) {
            //get rid of the overlay and initialize the chat
            $('#welcome_screen').fadeOut(300, function() {
               $(this).remove(); 
            });
            Chat.initializeChat(user);
        } else {
            $('#username_wrapper button').removeClass('btn-primary').addClass('btn-danger');
        }
    }

    var validateUsername = function (user) {
        return (user != "" && user != null);
    }
    
    $(document).ready(function() {
       bindEvents(); 
    });
    
})(window, document, jQuery, undefined);