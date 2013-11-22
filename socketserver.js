var express = require("express");
var mysql = require("mysql");
var app = express();
var port = 3700;
var io = require('socket.io').listen(app.listen(port));

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

    // Validate room name
    validate: function (name, password) {
        return true;
    }
};

var Message = {

    // Save the message to MySQL
    save: function (room_id, message, type, username, ip) {

        mysqlPool.getConnection(function (connErr, connection) {

            connection.query("INSERT INTO messages (room_id, message, type, username, ip_address, date_created) VALUES (?, ?, ?, ?, ?, NOW())", [room_id, message, type, username, ip], function (queryErr, rows, fields) {
                if (queryErr) throw queryErr;
                //console.log('Saved message: ', rows);
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
    var urlParts = request.url.split('/', 2);
    if (!urlParts[1]) {
        urlParts[1] = '';
    }
    var roomName = urlParts[1];

    // Retrieve room from database
    Room.get(roomName, function (room) {

        // If room doesn't exist, create it
        if (!room) {
            Room.save(roomName, 'Jordan', function (roomId) {
                response.render('index.html', {
                    room_id: roomId,
                    room_name: roomName
                }, function (err, html) {
                    response.send(html);
                });
            });

        } else {
            var roomId = room.id;
            response.render('index.html', {
                room_id: roomId,
                room_name: roomName
            }, function (err, html) {
                response.send(html);
            });
        }
    });
});

// Handle socket (chat) connections
io.sockets.on('connection', function (socket) {

    // User enters chat room
    socket.on('user:enter', function (data) {
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

        // Validate message
        if (!Message.validate(data.room_id, data.message, data.type, data.username)) {
            console.log(data);
            return false;
        }
        var ip_address = socket.handshake.address.address;

        // Save the message to database
        Message.save(data.room_id, data.message, data.type, socket.username, ip_address);

        // Broadcast message
        io.sockets. in (data.room_id).emit('chat:receive', data);
    });
});