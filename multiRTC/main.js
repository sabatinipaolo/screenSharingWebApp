'use strict';

var pcConfig = {
  'iceServers': [] ///QUI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
};

// Define action buttons.
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const video = document.getElementById('video');
const chiSono = document.getElementById('chiSono');
const partecipanti = document.getElementById('partecipanti');
const condivisore = document.getElementById('condivisore');
const chiSonoIo = document.getElementById('chiSonoIo');

var pc;
var videoStream;

let staCondividendo;
let staiGuardando;

const pari= new Map();
var pariToCondivisore

//*connessione al signal server
const socket = io.connect();


// Define media API
const displayMediaOptions = {
    video: {
      cursor: "always",
    },
    audio: false,
  };


startButton.onclick = async function (e) {

	//TODO crivi policy for polite 
	//polite=true;
    //cattura schermo e stream;
    {try {
      
      videoStream= await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions);
        
      //for (const track of videoStream.getTracks()) {
      //pc.addTrack(track, videoStream);
      //}  
        
      video.srcObject=videoStream;

    } catch (error) {
        console.log(error);
      }
    };	
    socket.emit('condivido');
    console.log("condivido");
    startButton.disabled=true;
    stopButton.disabled=false; 
    condivisore.innerHTML=socket.id;
    staCondividendo=socket.id;
};
  
  
stopButton.onclick = function (e) {
  //TODO : gestire errori ... 
  //assert : staCondividendo===  sonoIo
  
  socket.emit('stop_condivido');
  startButton.disabled=false;
  stopButton.disabled=true; //TODO è ridondante

  let tracks = video.srcObject.getTracks();
  tracks.forEach((track) => track.stop());
  video.srcObject = null;

  // Chiudo le connessionei tra pari ..
  if (pariToCondivisore ) { //TODO : è inutile l'if ??
	    pariToCondivisore.close();
	    pariToCondivisore.pc=null;
	    paricondivisore=null;
  } else { 
	  pari.forEach((pc, sock) => {
		  pc.pc.close(); 
		  pc.pc=null;pc=null;
	  });
	  pari.clear();
  }

};



{//***Funzioni SIGNAL*****************
//************************************
socket.on("connect", () => { 
  chiSono.innerHTML=socket.id;
});


socket.on('welcome', function (parStaCond) {
  console.log(" welcome from signal server" + parStaCond);
  
  condivisore.innerHTML = staCondividendo =parStaCond;
   	
  if (staCondividendo==="NESSUNO") {
	  console.log("  nessuno sta condividendo");
	  // abilita i tasti ....
	  startButton.disabled=false;
	  stopButton.disabled=true; //TODO è ridondante
  } else {
	  // chiedi al condivisore una connessione RTC
	    chiedeDiGuardare(parStaCond);
	  //TODO: 
  }
});


socket.on('sta_condividendo', function (staCondividendop) {
console.log("From SigSERV: sta condividendo"+staCondividendop);
  //TODO : gestire errori ... 
  //assert : staCondividendo==="NESSUNO"
  startButton.disabled=true;
  stopButton.disabled=true; //TODO è ridondante
  
  condivisore.innerHTML = staCondividendop;
  staCondividendo=staCondividendop;
  // chiedi al condivisiore una connessione RTC 
  chiedeDiGuardare(staCondividendo)
  //TODO ---
});

socket.on('stop_condividendo', function (staCondividendo) {
  //TODO : gestire errori 
  //assert : staCondividendo!=="NESSUNO"
  startButton.disabled=false;
  stopButton.disabled=true; //TODO è ridondante
  
  condivisore.innerHTML = "";
  video.srcObject = null;
  
  //TODO: chiusura dell connessioni peer?
  console.log("chiudo le connessioni");
  if (pariToCondivisore ) { //TODO : è inutile l'if ??
	    pariToCondivisore.pc.close();
	    pariToCondivisore.pc=null;
	    pariToCondivisore=null;
	    //delete pariToCondivisore;
  
  } else { 
	  pari.forEach((pc, sock) => {
		  pc.pc.close(); 
		  pc.pc=null;pc=null;
		  //delete pc; //TODO ?? sevre ??
	  });
	  pari.clear();
  }
  
});


socket.on('lista_stanza', function (lista) {
  partecipanti.innerHTML = lista;
});


socket.on("user_disconnected", async (sockID)=> {
	//TODO: 
	console.log("user disconnected ="+sockID);
	//pc.close();
	
});


socket.on("message-desc", async (sockFrom, sockTO, message)=> {
	//TODO : 
	console.log("message-desc from  ="+sockFrom);
	console.log("               to  ="+sockTO);
	console.log("           message ="+message);
	//console.log("message "+JSON.stringify(message));
	message=JSON.parse(message);
	
	if (pariToCondivisore ) { 
		console.log("pariconfividore TRUE"+pariToCondivisore);
		pc=pariToCondivisore;
	}
	else { 
		console.log("pariconfividore FAKSE");
	    pc=pari.get(sockFrom);
	} ;
	
    try {
		if (message.description) {
           pc.offerCollision = (message.description.type == "offer") &&
                     (pc.makingOffer || pc.pc.signalingState != "stable");

           pc.ignoreOffer = !pc.polite && pc.offerCollision;
           if (pc.ignoreOffer) { return; }

           await pc.pc.setRemoteDescription(message.description);
           if (message.description.type == "offer") {
			   console.log("è un offerta");
               await pc.pc.setLocalDescription();
               socket.emit("message-desc", socket.id, sockFrom, JSON.stringify({description:pc.pc.localDescription} ));
           }
        } else if (message.candidate) {
			       console.log("è un candidato???? "+message.candidate);
				   try {//TODO verificare se serve ancora...
					 await pc.pc.addIceCandidate(message.candidate);
					 console.log("aggiunto candidato "+message.candidate);
				   
				   } catch(err) {
						 if (!ignoreOffer) {
							  throw err;
						 }
				   }
              }
	} catch(err) {
			console.error(err);
	 }
});

socket.on("message-cand", async (sockFrom, sockTo, message)=> {
	console.log("message-cand  from="+sockFrom);
	console.log("                to="+sockTo);
	console.log("                  ="+message);
	//console.log("message "+JSON.stringify(message));
	message=JSON.parse(message);
    console.log("è un candidato ");
    	if (pariToCondivisore ) { 
		console.log("pariconfividore TRUE"+pariToCondivisore);
		pc=pariToCondivisore;
	}
	else { 
		pc=pari.get(sockFrom);
		console.log("pariconfividore FAKSE"+ pc);
	    pc=pari.get(sockFrom);
	} ;
	try {
		await pc.pc.addIceCandidate(message);
		console.log("aggiunto candidato "+message);

	} catch(err) {
		if (!pc.ignoreOffer) {
		  throw err;
	 }
	}
});



socket.on("vuole_guardare",  (sockFrom, sockTo)=> {

  //assert staCondividendo===socket.id;
  console.log("\nVuole Guradere ="+sockFrom);
  console.log("\n               ="+sockTo+" ??="+staCondividendo);
  
  // crea una RTCPeerconnection per socket....
  
  //let peer = {pc: new RTCPeerConnection(pcConfig), makingOffer : false , ignoreOffer: false, polite:false};
  let peer = new ConnessionePari(sockFrom);
  
  console.log("               = creata peerr per "+sockFrom);
 
  pari.set( sockFrom , peer );
  
  console.log("               = agg.gotracce per "+sockFrom);
 
  for (const track of videoStream.getTracks()) {
      peer.pc.addTrack(track, videoStream);
  }
  

});


/*fine funzioni signal*/  }




function chiedeDiGuardare(staCondividendo){
	
	//pariToCondivisore = new RTCPeerConnection(pcConfig);
	pariToCondivisore = new ConnessionePari(staCondividendo);
	
	console.log( "chiedo di guardare" );
	socket.emit("voglio_guardare",socket.id,staCondividendo);
	

}
	


    
class ConnessionePari {
  constructor(sockID) {
    this.makingOffer = false;
    this.ignoreOffer = false;
    this.polite = false;
    this.pc= new RTCPeerConnection(pcConfig);
    
    this.pc.onnegotiationneeded = async () => {
		console.log("onnegotiate needed with "+sockID);
		try {
			this.pc.makingOffer = true;
			await this.pc.setLocalDescription();
			console.log({ description: this.pc.localDescription } );
            socket.emit("message-desc", socket.id, sockID, JSON.stringify({description:this.pc.localDescription} ));
		} catch(err) {
			  console.error(err);
		} finally {
			 this.pc.makingOffer = false;
		} //try
    };
    
    this.pc.onicecandidate = (event)=> {
	//console.log("on ice candidate"+ event.candidate.candidate);
	  if (event.candidate) {
		  console.log("     invio candidate " + event.candidate.candidate);
		// Send the candidate to the remote peer
		socket.emit("message-cand", socket.id, sockID,  JSON.stringify(event.candidate));
		
	  } else {
		// All ICE candidates have been sent
	  }
	}
	
	this.pc.ontrack = ({track, streams}) => {
		console.log("ricevo traccia");
		track.onunmute = () => {
			if (video.srcObject) {
			return;
			}
		video.srcObject = streams[0];
		}
	}
  }
}

  


