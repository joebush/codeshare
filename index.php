<!DOCTYPE html>
<html>
<head>
    <title>Messaging Room</title>
    <link href="resources/css/main.css" rel="stylesheet" />
    <link href="resources/css/bootstrap.min.css" rel="stylesheet" />
    <link href="resources/css/codemirror.css" rel="stylesheet" />
    <link href="resources/css/theme/rubyblue.css" rel="stylesheet" />
    <script src="resources/js/jquery-1.10.2.min.js"></script>
    <script src="resources/js/codemirror.js"></script>
    <script src="resources/js/javascript.js"></script>
    <script src="resources/js/codeMirrorInit.js"></script>
    <script src="node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.min.js"></script>
    <script src="resources/js/socket.js"></script>
</head>
<body>
    <section id='main_wrapper'>
        <aside id='user_list_wrapper'>
            <div id='user_list'>
                <div id='user_list_heading'>
                    <i class='glyphicon glyphicon-user'></i>
                    <span>Current Users</span>
                </div>
                <div class='user_entry'>
                    <p>Matthew Sessions</p>
                </div>
            </div>
        </aside>
        <section id='chat_wrapper' ng-controller="ChatController">
            <div id='chat_window'>
                <div class='chat code'>
                    <p class='user'>Matt Sessions has sent code</p>
                    <p class='time'>10:10:30 PM</p>
                    <p class='code_message'>
                        <button class='btn btn-primary'>
                            <i class='glyphicon glyphicon-cloud-download'></i>
                            <br>Download Code</button>
                        <button class='btn btn-primary'>
                            <i class='glyphicon glyphicon-indent-left'></i>
                            <br>Edit Code</button>
                    </p>
                </div>
            </div>
            <div id='chat_input'>
                <textarea placeholder="Send Message..." id='message'></textarea>
                <button class='btn btn-primary'>
                    <i class='glyphicon glyphicon-envelope'></i>
                </button>
            </div>
        </section>
        <section id='code_input_wrapper'>
            <textarea id='code_entry'></textarea>
            <div id='submit_button'>
                <button class='btn btn-primary'>
                    <i class='glyphicon glyphicon-cloud-upload'></i>
                    <br>Submit Code</button>
            </div>
        </section>
    </section>
</body>
</html>