'use strict';

var pcConfig = {
  'iceServers': [] ///QUI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
};

// Define action buttons.
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const partecipanti = document.getElementById('partecipanti');
const condivisore = document.getElementById('condivisore');
const chiSonoIo = document.getElementById('chiSonoIo');

//var room="LAB";

var socket = io.connect();
//socket.emit('join',room);

socket.on("connect", () => { 
  chiSonoIo.innerHTML=socket.id;
});

socket.on('lista_stanza', function (lista) {
  partecipanti.innerHTML = lista;
});


socket.on('sta_condividendo', function (staCondividendo) {
  condivisore.innerHTML = staCondividendo;
});

socket.on('stop_condividendo', function (staCondividendo) {
  condivisore.innerHTML = "";
});

startButton.onclick = function() {
       socket.emit('condivido');
       console.log("CONDIVIDO CLICK");
}

stopButton.onclick = function() {
       socket.emit('stop_condivido');
         console.log("STOP CONDIVIDO CLICK");
}
