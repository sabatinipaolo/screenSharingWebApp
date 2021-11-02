'use strict';

const os = require('os');
const http = require('http');
const nodeStatic = require('node-static');

const { Server } = require("socket.io");
var fileServer = new(nodeStatic.Server)();

var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
});
console.log('listening on http://localhost:8080');

const io = new Server(app);
app.listen(8080);



io.on('connection', (socket) => {
  console.log('a user connected ');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });


  socket.on('message', (sockID, message)=>{
    console.log("message from="+sockID);
	console.log("message "+message);
    socket.broadcast.emit( 'message', sockID, message );
  });
    socket.on('message-cand', (sockID, message)=>{
    console.log("message-cand from="+sockID);
	console.log("                 ="+message);
    socket.broadcast.emit( 'message-cand', sockID, message );
  });
    socket.on('message-desc', (sockID, message)=>{
    console.log("message desc="+sockID);
	console.log("            ="+message);
    socket.broadcast.emit( 'message-desc', sockID, message );
  });
  


});




