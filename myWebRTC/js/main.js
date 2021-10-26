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
const video = document.getElementById('video');

// Define media API
const displayMediaOptions = {
    video: {
      cursor: "always",
    },
    audio: false,
  };
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
       startSharing() ;
}

stopButton.onclick = function() {
       socket.emit('stop_condivido');
         console.log("STOP CONDIVIDO CLICK");
         stopSharing();
}

//MEDIA API FUNCTION
async function startSharing() {
    try {
      video.srcObject = await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions
      );
      } catch (error) {
        console.log(error);
      }
    }
    
  function stopSharing() {
      let tracks = video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    } 
