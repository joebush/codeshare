var express = require("express");
var mysql = require("mysql");
var bcrypt = require("bcrypt");
var fs = require('fs');
var app = express();
var port = 3700;
var io = require('socket.io').listen(app.listen(port, "0.0.0.0"), "0.0.0.0");

var mysqlPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'codeshare'
});

var users = [];


var Room = {

    // Save the room to MySQL
    save: function (name, creator, callback) {

        mysqlPool.getConnection(function (connErr, connection) {

            var insertId = connection.query("INSERT INTO rooms (name, created_by, date_created) VALUES (?, ?, NOW())", [name, creator], function (queryErr, rows, fields) {
                if (queryErr) throw queryErr;
                //console.log('Saved room: ', rows);

                callback(rows.insertId);
            });
            connection.release();
        });
    },

    get: function (name, callback) {

        mysqlPool.getConnection(function (connErr, connection) {

            connection.query("SELECT * FROM rooms WHERE name =?", [name], function (queryErr, rows, fields) {
                if (queryErr) throw queryErr;
                var room = null;
                if (rows[0]) {
                    room = rows[0];
                }

                callback(room);
            });
            connection.release();
        });
    },

    get_messages: function (room_id, callback) {
        mysqlPool.getConnection(function (connErr, connection) {
            connection.query("SELECT * FROM messages WHERE room_id = ?", [room_id], function (queryErr, rows, fields) {
                if (queryErr) throw queryErr;
                //console.log('Room messages: ', rows);

                callback(rows);
            });
            connection.release();
        });
    },

    //make a room private
    makePrivate: function (room_id, password, callback) {
        mysqlPool.getConnection(function (connErr, connection) {
            console.log(password);
            connection.query("UPDATE rooms SET password = ? WHERE id = ?", [password, room_id], function (queryErr) {
                if (queryErr) throw queryErr;

                if (typeof (callback) === "function") {
                    callback();
                }
            });
            connection.release();
        });
    },

    //authenticate someone against the rooms password
    authenticate: function (room_id, password, callback) {
        mysqlPool.getConnection(function (connErr, connection) {
            connection.query("SELECT * FROM rooms WHERE id = ?", [room_id], function (queryErr, rows) {
                if (queryErr) throw queryErr;
                var room;
                if (rows[0]) {
                    room = rows[0];
                    if (password != "") {
                        if (!bcrypt.compareSync(password, room.password)) {
                            room = false;
                        }
                    }
                } else {
                    room = false;
                }
                callback(room);
            });
            connection.release();
        });
    },

    // Validate room name$
    validate: function (name, password) {
        return true;
    }
};

var Message = {

    // Save the message to MySQL
    save: function (room_id, message, type, username, ip, callback) {

        mysqlPool.getConnection(function (connErr, connection) {

            connection.query("INSERT INTO messages (room_id, message, type, username, ip_address, date_created) VALUES (?, ?, ?, ?, ?, NOW())", [room_id, message, type, username, ip], function (queryErr, rows, fields) {
                if (queryErr) throw queryErr;
                //console.log('Saved message: ', rows);
                if (typeof (callback) === "function") {
                    callback(rows.insertId);
                }
            });

            connection.release();
        });
    },

    get: function (message_id, callback) {
        mysqlPool.getConnection(function (connErr, connection) {
            connection.query("SELECT * FROM messages WHERE id = ?", [message_id], function (queryErr, rows, fields) {
                if (queryErr) throw queryErr;
                if (rows[0]) {
                    if (typeof (callback) === "function") {
                        callback(rows[0]);
                    }
                }
            });
            connection.release();
        });
    },

    // Validate that message parameters are not empty
    validate: function (room_id, message, type, username) {
        if (!room_id) {
            return false;
        }

        if (!message) {
            return false;
        }

        if (type != 'message' && type != 'code') {
            return false;
        }

        if (!username) {
            return false;
        }
        return true;
    }
};

var Users = {
    _users: {},

    add: function (room_id, username) {
        if (!this._users[room_id]) {
            this._users[room_id] = [];
        }
        this._users[room_id].push(username);
    },

    get: function (room_id) {
        return this._users[room_id];
    },

    remove: function (room_id, username) {
        var users = this.get(room_id);
        if (users != undefined) {
            this._users[room_id].splice(users.indexOf(username), 1);
        }
    }
};

app.use('/resources', express.static(__dirname + '/resources'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

// Handle index of application
app.get('/*', function (request, response) {

    // Split up URL to determine room name
    var urlParts = request.url.split('/', 3);
    if (!urlParts[1]) {
        urlParts[1] = '';
    }
    //if the url is download
    if (urlParts[1] === "Download") {
        //server a download of the message
        var message_id = urlParts[2];
        Message.get(message_id, function (message) {
            if (message) {
                var filename = "temp/" + message.id + ".code";
                //create a temporary file to allow the user to download
                fs.writeFile(filename, message.message, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        //send the download response
                        response.download(filename, function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                //remove the temporary file
                                fs.unlink(filename);
                            }
                        });
                    }
                });
            }
        });

    } else {

        var roomName = urlParts[1];

        // Retrieve room from database
        Room.get(roomName, function (room) {

            // If room doesn't exist, create it
            if (!room) {
                Room.save(roomName, 'Jordan', function (roomId) {
                    response.render('index.html', {
                        room_id: roomId,
                        room_name: roomName,
                        new_room: true,
                        passwordProtected: false
                    }, function (err, html) {
                        response.send(html);
                    });
                });

            } else {
                var roomId = room.id;
                response.render('index.html', {
                    room_id: roomId,
                    room_name: roomName,
                    new_room: false,
                    passwordProtected: (room.password != "") ? true : false
                }, function (err, html) {
                    response.send(html);
                });
            }
        });
    }
});

// Handle socket (chat) connections
io.sockets.on('connection', function (socket) {
    // User enters chat room
    socket.on('user:enter', function (data) {
        //authenticate user with their provided password
        Room.authenticate(data.room_id, data.password, function (room) {
            //if the password was correct proceed
            if (room != false) {
                console.log('joining room: ' + data.room_id);
                socket.username = data.username;
                socket.room_id = data.room_id;
                socket.join(data.room_id);

                // Retrieve history of all past messages in this room
                Room.get_messages(data.room_id, function (messages) {

                    // Send chat history only to this user
                    io.sockets.socket(socket.id).emit('chat:history', messages);
                });

                // Add this user to list
                Users.add(data.room_id, data.username);

                // Broadcast the new user list to everyone
                io.sockets.emit('user:list', {
                    usernames: Users.get(data.room_id)
                });
                //let them know they were succesful
                io.sockets.socket(socket.id).emit('user:enter:response', {
                    response: true
                });
            } else {
                //let them know it failed
                io.sockets.socket(socket.id).emit('user:enter:response', {
                    response: false
                });
            }
        });
    });

    // If client disconnects (closes browser window), remove them from user list
    socket.on('disconnect', function (data) {
        //socket.leave( socket.room_id );
        Users.remove(socket.room_id, socket.username);
        io.sockets.emit('user:list', {
            usernames: Users.get(socket.room_id)
        });
    });

    // User sends a message
    socket.on('chat:send', function (data) {
        console.log(JSON.stringify(data));
        // Validate message
        if (!Message.validate(data.room_id, data.message, data.type, data.username)) {
            console.log(data);
            return false;
        }
        var ip_address = socket.handshake.address.address;

        // Save the message to database
        Message.save(data.room_id, data.message, data.type, socket.username, ip_address, function (message_id) {
            if (data.type == "code") {
                data.id = message_id;
            }
            // Broadcast message
            io.sockets. in (data.room_id).emit('chat:receive', data);
        });
    });


    //User sends wanting to make the room he just created private
    socket.on('room:private', function (data) {
        //Validate Password
        if (data.password == null || data.password == "") {
            console.log(data);
            return false;
        }
        //hash the password
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(data.password, salt);
        console.log(hash);
        Room.makePrivate(data.room_id, hash);
    });
});