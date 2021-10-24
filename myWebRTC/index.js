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


var staCondividendo="NESSUNO";

 

io.on('connection', (socket) => {
  console.log('a user connected ');



  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('join', (room) => {
    
    socket.join(room);
    
    var clientsInRoom = io.sockets.adapter.rooms.get(room);
    var numClients = clientsInRoom.size
    
    console.log('user join ' + room);
    console.log('user join ' + numClients);
    console.log(clientsInRoom.toString());
    io.to(room).emit('lista_stanza',Array.from(clientsInRoom).join(' '));
   
  });
  
  socket.on('condivido', (room) => {
    console.log("ciao  "+staCondividendo)
    if (staCondividendo == "NESSUNO"){
      staCondividendo=socket.id;
      console.log('ssss='+staCondividendo);
      io.to(room).emit('sta_condividendo', staCondividendo);
      
    }
   
  });
  
  
  socket.on('stop_condivido', (room) => {
    console.log("ciaoonnn  "+staCondividendo)
    if (staCondividendo != "NESSUNO"){
      staCondividendo="NESSUNO";
      console.log('ssss='+staCondividendo);
      io.to(room).emit('stop_condividendo');
      
    }
   
  });



});




