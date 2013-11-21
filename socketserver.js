var express = require("express");
var mysql = require("mysql");
var app = express();
var port = 3700;
var io = require('socket.io').listen(app.listen(port));

var mysqlPool = mysql.createPool({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'codeshare'
});

var message = {

	// Save the message to MySQL
	save: function(message, type, username){
		mysqlPool.getConnection(function(connErr, connection) {

			connection.query("INSERT INTO messages (message, type, username, date_created) VALUES (?, ?, NOW())",
				[message, type, username], function(queryErr, rows, fields) {
				if (queryErr) throw queryErr;
				console.log('The solution is: ', rows);
			});

			connection.release();
		});
	},

	// Make sure message parameters are not empty
	validate: function(message, type, username){
		if(!message){
			return false;
		}

		if(type != 'message' && type != 'code'){
			return false;
		}

		if(!username){
			return false;
		}
		return true;
	}
};

io.sockets.on('connection', function (socket) {

    socket.emit('message', { message: 'Welcome to the chat' });

	// Client sends a message
    socket.on('send', function (data) {

		// Validate message
		if(!message.validate(data.message, data.type, data.username)){
			return false;
		}

		// Save the message to database
        message.save(data.message, data.type, data.username);

		// Broadcast message to other users
        io.sockets.emit('message', data);
    });
});
