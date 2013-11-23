function Message(username, type, message, id) {
    
    this.id = id;
    this.room_id = ROOM_ID;
    this.username = username;
    this.type = type;
    this.message = message;
    var date = new Date();
    this.time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    this.element;
}

Message.prototype.createMessageElement = function () {
    var element = document.createElement("div");
    element.className = "chat";
    element.innerHTML = "<p class='user'>" + this.username + " has sent a message</p><p class='time'>" + this.time + "</p><p class='chat_message'>" + this.message + "</p></div>";
    this.element = element;
}

Message.prototype.createCodeElement = function () {
    var element = document.createElement("div");
    element.className = "chat";
    element.innerHTML = "<p class='user'>" + this.username + " has sent code</p>";
    element.innerHTML += "<p class='time'>" + this.time + "</p>";
    element.innerHTML += "<p class='code_message'><a href='/Download/" + this.id + ".code' class='btn btn-primary'><i class='glyphicon glyphicon-cloud-download'></i><br>Download Code</a><button class='btn btn-primary edit_code'><i class='glyphicon glyphicon-indent-left'></i><br>Edit Code</button></p></div>";
    this.element = element;
}

Message.prototype.appendNewMessage = function (html) {
    if (this.type === "code") {
        this.createCodeElement();
        this.bindEvents();
    } else {
        this.createMessageElement();
    }
    $('#chat_window').append(this.element);
}

Message.prototype.validateMessage = function () {
    return this.message && this.username && (this.type === "code" || this.type === "message");
}

Message.prototype.bindEvents = function() {
    var message = this;
    $(this.element).find('.edit_code').click(function() {
         myCodeMirror.setValue(message.message);
    });
}