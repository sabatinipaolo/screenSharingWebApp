'use strict';

var isInitiator= false;


var pcConfig = {
  'iceServers': [] ///QUI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
};

// Define action buttons.
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const partecipanti = document.getElementById('partecipanti');
const condivisore = document.getElementById('condivisore');
const chiSonoIo = document.getElementById('chiSonoIo');




var room="LAB";


var socket = io.connect();
socket.emit('join',room);


socket.on("connect", () => { 
  chiSonoIo.innerHTML=socket.id;
});

socket.on('lista_stanza', function (lista) {
  console.log(lista);
  partecipanti.innerHTML = lista;
  isInitiator = true;
});


socket.on('sta_condividendo', function (staCondividendo) {
  	console.log("staaaaaaa");
  condivisore.innerHTML = staCondividendo;
});

socket.on('stop_condividendo', function (staCondividendo) {
  	console.log("stopoooop");
  condivisore.innerHTML = "";
});


startButton.onclick = function() {
	console.log("click start");
   socket.emit('condivido',room);
}

stopButton.onclick = function() {
	console.log("click stop");
   socket.emit('stop_condivido',room);
}

