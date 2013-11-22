function Message(username, type, message) {
    
    this.username = username;
    this.type = type;
    this.message = message;
    var date = new Date();
    this.time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}