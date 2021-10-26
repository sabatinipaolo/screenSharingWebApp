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
  let clients = io.sockets.sockets;// is a Map
  io.sockets.emit('lista_stanza',Array.from(clients.keys()).join(' '));

  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.sockets.emit('lista_stanza',Array.from(clients.keys()).join(''));
  });

  socket.on('condivido', () => {
    if (staCondividendo == "NESSUNO"){
      staCondividendo=socket.id;
      io.sockets.emit('sta_condividendo', staCondividendo);
    }

  });
  
  socket.on('stop_condivido', () => {
    console.log("stop condivido");
    if (staCondividendo != "NESSUNO"){
      if ( staCondividendo == socket.id ) {
            staCondividendo="NESSUNO";
            io.sockets.emit('stop_condividendo');
      }
    }
  });

});




