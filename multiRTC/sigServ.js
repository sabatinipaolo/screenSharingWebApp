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



let staCondividendo="NESSUNO";
let clients = io.sockets.sockets;// is a Map

//io.sockets.emit('lista_stanza',Array.from(clients.keys()).join(' '));


io.on('connection', (socket) => {
  console.log('a user connected ');
  console.log("  nume connessioni="+clients.size);
 
  //
  socket.emit('welcome',staCondividendo);

  
  //informa tutti gli altri 
  //socket.broadcast.emit('new_user'.socket.id);
  io.sockets.emit('lista_stanza',Array.from(clients.keys()).join(' '));



  socket.on('disconnect', () => {
    console.log('user disconnected');
    console.log("  nume connessioni="+clients.size);

    socket.broadcast.emit( 'user_disconnected', socket.id);
  });
  
  socket.on('condivido', () => {
    if (staCondividendo == "NESSUNO"){
      staCondividendo=socket.id;
      
      socket.broadcast.emit('sta_condividendo', staCondividendo);
      //io.sockets.emit('sta_condividendo', staCondividendo);
    } else { console.log ("ERRORE : richiesta di condicvione in conflitto"); }
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
  
  
  /*
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
  


});*/




