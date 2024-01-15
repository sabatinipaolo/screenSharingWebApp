"use strict";

var pcConfig = {
    iceServers: [], ///QUI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
};

// Define action buttons.
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const video = document.getElementById("video");
const chiSono = document.getElementById("chiSono");
const partecipanti = document.getElementById("partecipanti");
const condivisore = document.getElementById("condivisore");

//var pc;
var videoStream;

let broadcaster;

const connessioniConViewers = new Map();
var connessioneAlBroadcaster= null;

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
    //cattura schermo e stream;
    try {
        videoStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        video.srcObject = videoStream;
    } catch (error) {
        console.log(error);
    }
    socket.emit("inizio_broadcast");
    console.log("inizio_broadcast");
    startButton.disabled = true;
    stopButton.disabled = false;
    condivisore.innerHTML = socket.id;
    broadcaster = socket.id;
};

stopButton.onclick = function (e) {
    //TODO : gestire errori ...
    //assert : broadcaster ===  socket.id

    socket.emit("fermo_broadcast"); //TO DO: spostare in fondo?
    startButton.disabled = false;
    stopButton.disabled = true; //TODO è ridondante

    let tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    video.srcObject = null;

    // Chiudo le connessioniConViewers ..
    if (connessioneAlBroadcaster) {
        //TODO : è inutile l'if ??
        connessioneAlBroadcaster.close();
        connessioneAlBroadcaster.pc = null;
        connessioniConViewerscondivisore = null;
    } else {
        if (connessioniConViewers.size != 0) {
            connessioniConViewers.forEach((pc, sock) => {
                pc.pc.close();
                pc.pc = null;
                pc = null;
            });
            connessioniConViewers.clear();
        }
    }
    // aggiorno UI
    condivisore.innerHTML = "";
    broadcaster = "NESSUNO";
};

{
    //***Funzioni SIGNAL*****************
    //************************************

    socket.on("connect", () => {
        chiSono.innerHTML = socket.id;
        console.log("connesso al server mio ID="+socket.id )
    });

    socket.on("welcome", function (broadcasterDalServer) {
        console.log("welcome from signal server, sta condividendo= " + broadcasterDalServer);

        condivisore.innerHTML = broadcaster = broadcasterDalServer;

        if (broadcaster === "NESSUNO") {
            // abilita i tasti ....
            startButton.disabled = false;
            stopButton.disabled = true; //TODO è ridondante
        } else {
            // chiedi al condivisore una connessione RTC
            chiedeDiGuardare(broadcaster);
            //TODO:
        }
    });

    socket.on("sta_condividendo", function (broadcasterDalServer) {
        console.log("From SigSERV: sta condividendo" + broadcasterDalServer);
        //TODO : gestire errori ...
        //assert : broadcaster==="NESSUNO"
        startButton.disabled = true;
        stopButton.disabled = true; //TODO è ridondante
        condivisore.innerHTML = broadcasterDalServer;
        broadcaster = broadcasterDalServer;
        // chiedi al condivisiore una connessione RTC
        chiedeDiGuardare(broadcasterDalServer);
    });

    socket.on("stop_condividendo", function (broadCasterCheHaFermatoCondivisione) {
        //TODO : gestire errori
        //assert : broadcaster===broadCasterCheHaFermatoCondivisione
        startButton.disabled = false;
        stopButton.disabled = true; //TODO è ridondante

        condivisore.innerHTML = "";
        broadcaster = "NESSUNO";
        video.srcObject = null;

        //TODO: chiusura dell connessioni peer?
        console.log("chiudo le connessioni");

        //assert : connessioneAlBroadcasternon è nulla (o undefined)
        if (connessioneAlBroadcaster) {
            //TODO : è inutile l'if ??
            connessioneAlBroadcaster.pc.close();
            connessioneAlBroadcaster.pc = null;
            connessioneAlBroadcaster= null;
        } else {
            connessioniConViewers.forEach((pc, sock) => {
                pc.pc.close();
                pc.pc = null;
                pc = null;
            });
            connessioniConViewers.clear();
        }
    });

    socket.on("lista_stanza", function (lista) {
        partecipanti.innerHTML = lista;
    });

    socket.on("user_disconnected", async (sockID) => {
        console.log("user disconnected =" + sockID);
        //TODO:   chiudere la connessione con il disconnesso ?? ..
        //        verifica se stava condividendo ...
        console.log("  broadcaster =" + broadcaster);
        let pc;
        if (broadcaster == sockID) {
            console.log("      il client disconnesso stava condividendo");
            //chiudo la connessione con il client
            if (connessioneAlBroadcaster) {
                console.log("1");
                connessioneAlBroadcaster.pc.Close();
                connessioneAlBroadcaster.pc = null;
                connessioneAlBroadcaster= null;
            } else {
                console.lofg("ERRROOEREEE");
                //TODO : siverifica sonlo nel caso il condivisore si è
                //disconnesso prima che il visore abbia fatto in tempo
                //a crare la variabile connessioneAlBroadcaster
            }
        } else {
            //Il disconnesso è un visore
            if (broadcaster == socket.Id) {
                //sono io che condivido
                console.log("2");
                pc = connessioniConViewers.get(sockID);
                pc.pc.close();
                pc.pc = null;
                pc = null;
                connessioniConViewers.delete(sockID);
            } else {
                // io sono un visore e lo è anche il disconnesso,
                // faccio nulla ( la lista dei partecipanti
                // viene inviata dal server)
            }
        }
    });

    socket.on("message-desc", async (sockFrom, sockTO, message) => {
        //TODO :
        console.log("message-desc from  =" + sockFrom);
        console.log("               to  =" + sockTO);
        //console.log("           message ="+message);
        //console.log("message "+JSON.stringify(message));
        message = JSON.parse(message);

        let pc;
        if (connessioneAlBroadcaster) {
            console.log("connessione al Broadcaster " + connessioneAlBroadcaster);
            pc = connessioneAlBroadcaster;
        } else {
            console.log("connessioneAlBroadcaster FAlSE NON SONO VIEWER");
            pc = connessioniConViewers.get(sockFrom);
        }

        try {
            if (message.description) {
                pc.offerCollision =
                    message.description.type == "offer" &&
                    (pc.makingOffer || pc.pc.signalingState != "stable");

                pc.ignoreOffer = !pc.polite && pc.offerCollision;

                if (pc.ignoreOffer) {
                    return;
                }

                await pc.pc.setRemoteDescription(message.description);

                if (message.description.type == "offer") {
                    console.log("è un offerta");
                    await pc.pc.setLocalDescription();
                    //TODO: vedi di elimanare JSON.stringify ..
                    socket.emit(
                        "message-desc",
                        socket.id,
                        sockFrom,
                        JSON.stringify({ description: pc.pc.localDescription })
                    );
                }
            } else if (message.candidate) {
                //TODO: non dovrebbe più servire
                console.log("è un candidato???? " + message.candidate);
                try {
                    await pc.pc.addIceCandidate(message.candidate);
                    console.log("aggiunto candidato " + message.candidate);
                } catch (err) {
                    if (!ignoreOffer) {
                        throw err;
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("message-cand", async (sockFrom, sockTo, message) => {
        console.log("message-cand  from=" + sockFrom);
        console.log("                to=" + sockTo);
        console.log("                  =" + message);
        //console.log("message "+JSON.stringify(message));

        message = JSON.parse(message);
        console.log("è un candidato ");
        let pc;
        if (connessioneAlBroadcaster) {
            console.log("connessione al Broadcaster " + connessioneAlBroadcaster);
            pc = connessioneAlBroadcaster;
        } else {
            console.log("connessioneAlBroadcaster FAlSE NON SONO VIEWER");
            pc = connessioniConViewers.get(sockFrom);
        }
        try {
            await pc.pc.addIceCandidate(message);
            console.log("aggiunto candidato " + message);
        } catch (err) {
            if (!pc.ignoreOffer) {
                throw err;
            }
        }
    });

    socket.on("vuole_guardare", (sockFrom, sockTo) => {
        //assert broadcaster===socket.id===sockTo;
        console.log("\nVuole Guradere =" + sockFrom);
        console.log("\n               =" + sockTo + " ??=" + broadcaster);

        // crea una RTCPeerconnection per socket....
        let peer = new ConnessionePari(sockFrom, false);

        console.log("               = creata peer per " + sockFrom);

        connessioniConViewers.set(sockFrom, peer);

        console.log("               = agg.gotracce per " + sockFrom);

        for (const track of videoStream.getTracks()) {
            peer.pc.addTrack(track, videoStream);
        }
    });

    /*fine funzioni signal*/
}

function chiedeDiGuardare(clientCheStaCondividendo) {
    connessioneAlBroadcaster= new ConnessionePari(clientCheStaCondividendo, true);
    console.log("invio msg 'voglio guardare' "+clientCheStaCondividendo );
    socket.emit("voglio_guardare", socket.id, clientCheStaCondividendo);
}

class ConnessionePari {
    constructor(sockID, p) {
        this.makingOffer = false;
        this.ignoreOffer = false;
        this.polite = p;
        this.pc = new RTCPeerConnection(pcConfig);

        this.pc.onnegotiationneeded = async () => {
            console.log("on negotiate needed with " + sockID);
            try {
                this.pc.makingOffer = true;
                await this.pc.setLocalDescription();
                console.log({ description: this.pc.localDescription });
                socket.emit(
                    "message-desc",
                    socket.id,
                    sockID,
                    JSON.stringify({ description: this.pc.localDescription })
                );
            } catch (err) {
                console.error(err);
            } finally {
                this.pc.makingOffer = false;
            } //try
        };

        this.pc.onicecandidate = (event) => {
            //console.log("on ice candidate"+ event.candidate.candidate);
            if (event.candidate) {
                console.log("     invio candidate " + event.candidate.candidate);
                // Send the candidate to the remote peer
                socket.emit("message-cand", socket.id, sockID, JSON.stringify(event.candidate));
            } else {
                // All ICE candidates have been sent
            }
        };
        this.pc.oniceconnectionstatechange = () => {
            if (this.pc.iceConnectionState === "failed") {
              this.pc.restartIce();
            }
        }
        //this.pc.oniceconnectionstatechange = () => {
        //console.log("pc oniceconectionstatechange ="+this.pc.iceConnectionState );
        //if (this.pc.iceConnectionState === "failed") {
        //console.log("    connections failed, call IceRestard");
        //this.pc.restartIce();
        //}
        //}

        this.pc.ontrack = ({ track, streams }) => {
            console.log("ricevo traccia");
            track.onunmute = () => {
                if (video.srcObject) {
                    console.log("videosrcobject");
                    return;
                }
                video.srcObject = streams[0];
                console.log("videosrcobject=stream");
            };
        };
    }
}
