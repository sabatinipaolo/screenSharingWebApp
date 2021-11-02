'use strict';

var pcConfig = {
  'iceServers': [] ///QUI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
};

// Define action buttons.
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const video = document.getElementById('video');
const chiSono = document.getElementById('chiSono');


var pc;
pc = new RTCPeerConnection(pcConfig);
var videoStream;

let makingOffer = false;
let ignoreOffer = false;
let polite=false;

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
	polite=true;
    //cattura schermo e stream;
    {try {
      
      videoStream= await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions);
        
      for (const track of videoStream.getTracks()) {
      pc.addTrack(track, videoStream);
      }  
        
      video.srcObject=videoStream;

    } catch (error) {
        console.log(error);
      }
    };
    
    
    
    

  };
  
  
stopButton.onclick = function (e) {
    stopSharing();
  };

//***********
// fuzioni RTC
//************
{
pc.onnegotiationneeded = async () => {
  console.log("onnegotiationneeded occur");
  try {
    makingOffer = true;
    await pc.setLocalDescription();
    socket.emit("message-desc", socket.id,  JSON.stringify({description:pc.localDescription} ));
  } catch(err) {
      console.error(err);
  } finally {
      makingOffer = false;
  }
  
}

//Handling incoming tracks
pc.ontrack = ({track, streams}) => {
		console.log("ricevo traccia");
		track.onunmute = () => {
			if (video.srcObject) {
			return;
			}
		video.srcObject = streams[0];
		}
}

pc.onicecandidate = (event)=> {
//console.log("on ice candidate"+ event.candidate.candidate);
  if (event.candidate) {
	  console.log("     invio candidate " + event.candidate.candidate);
    // Send the candidate to the remote peer
    socket.emit("message-cand", socket.id,  JSON.stringify(event.candidate));
    
  } else {
    // All ICE candidates have been sent
  }
}
//* fine funzioni RTC
}

//********************
//*Funzioni SIGNAL
//********************
{
socket.on("connect", () => { 
  chiSono.innerHTML=socket.id;
});

socket.on("message-desc", async (sockID, message)=> {
	console.log("message from="+sockID);
	console.log("message "+message);
	//console.log("message "+JSON.stringify(message));
	message=JSON.parse(message);
    try {
		if (message.description) {
           const offerCollision = (message.description.type == "offer") &&
                     (makingOffer || pc.signalingState != "stable");

           ignoreOffer = !polite && offerCollision;
           if (ignoreOffer) { return; }

           await pc.setRemoteDescription(message.description);
           if (message.description.type == "offer") {
			   console.log("è un offerta");
               await pc.setLocalDescription();
               socket.emit("message-desc", socket.id,  JSON.stringify({description:pc.localDescription} ));
           }
        } else if (message.candidate) {
			       console.log("è un candidato "+message.candidate);
				   try {
					 await pc.addIceCandidate(message.candidate);
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

socket.on("message-cand", async (sockID, message)=> {
	console.log("message-cand  from="+sockID);
	console.log("                  ="+message);
	//console.log("message "+JSON.stringify(message));
	message=JSON.parse(message);
    console.log("è un candidato ");
try {
 await pc.addIceCandidate(message);
 console.log("aggiunto candidato "+message);

} catch(err) {
	 if (!ignoreOffer) {
		  throw err;
	 }
}
});

//*fine funzioni signal
}

async function startSharing() {
    //cattura schermo e stream;
    try {
      
      videoStream= await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions);
        
      for (const track of videoStream.getTracks()) {
      pc.addTrack(track, videoStream);
      }  
        
      video.srcObject=videoStream;

    } catch (error) {
        console.log(error);
      }
    //Handling incoming tracks
    pc.ontrack = ({track, streams}) => {
		console.log("ricevo traccia");
		track.onunmute = () => {
		if (remoteVideo.srcObject) {
		return;
		}
		remoteVideo.srcObject = streams[0];
  };
};

    // onnegotiationneeded 
  

    pc.onnegotiationneeded = async () => {
		console.log("onnegotiate neede");
		try {
			makingOffer = true;
			await pc.setLocalDescription();
			;
			console.log({ description: pc.localDescription } );
//			socket.emit( "message", { description: pc.localDescription });
			socket.emit( "message",  {data:{ description: pc.localDescription }});
		} catch(err) {
			  console.error(err);
		} finally {
			makingOffer = false;
		} //try
    };
    
    //Handling incoming ICE candidates
    pc.onicecandidate = ({candidate}) => socket.emit( "message",{candidate});

    //Handling incoming messages on the signaling channel
    let ignoreOffer = false;

	
    
    
    
 
      
}//end startSharing()


function stopSharing() {
      let tracks = video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      video.srcObject = null;
    }

