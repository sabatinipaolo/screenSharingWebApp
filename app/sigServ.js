"use strict";
//prova ...
const os = require("os");
const https = require("https");
const nodeStatic = require("node-static");

const { Server } = require("socket.io");
var fileServer = new nodeStatic.Server();

const fs = require("fs");

const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
};

var app = https.createServer(options, function (req, res) {
    fileServer.serve(req, res);
});
console.log("listening on https://localhost:8080");

const io = new Server(app);
app.listen(8080);

let staCondividendo = "NESSUNO";
let clients = io.sockets.sockets; // is a Map

io.on("connection", (socket) => {
    console.log("\n connesso user con ID="+socket.id);
    console.log("          num connessioni=" + clients.size);

    socket.emit("welcome", staCondividendo);

    //informa tutti gli altri
    io.sockets.emit("lista_stanza", Array.from(clients.keys()).join(" "));

    socket.on("disconnect", () => {
        console.log("signal disconnect" + socket.id);
        console.log("   num conn.ni=" + clients.size);

        socket.broadcast.emit("user_disconnected", socket.id);
        //TODO controllare se era il condivisore, qui o sui client ?

        io.sockets.emit("lista_stanza", Array.from(clients.keys()).join(" "));
        if (socket.id == staCondividendo) {
            staCondividendo = "NESSUNO";
        }
    });

    socket.on("inizio_broadcast", () => {
        console.log("\ninizio_broadcast =" + socket.id + "   staCindividendo=" + staCondividendo);

        if (staCondividendo == "NESSUNO") {
            staCondividendo = socket.id;
            socket.broadcast.emit("sta_condividendo", staCondividendo);
        } else {
            console.log("ERRORE : richiesta di condicvione in conflitto");
        }
    });

    socket.on("stop_condivido", () => {
        console.log("stop condivido " + socket.id + " condi=" + staCondividendo);

        if (staCondividendo != "NESSUNO") {
            if (staCondividendo == socket.id) {
                staCondividendo = "NESSUNO";
                socket.broadcast.emit("stop_condividendo");
            } else console.log("ERRORE !!! non è lui che sta condividendo");
        }
    });

    socket.on("voglio_guardare", (sockFrom, sockTo) => {
        console.log("\nvoglio guardare from=" + sockFrom);
        console.log("                  to=" + sockTo);

        socket.to(sockTo).emit("vuole_guardare", sockFrom, sockTo);
    });

    socket.on("message-desc", (sockFrom, sockTo, message) => {
        console.log("\nmessage desc from=" + sockFrom);
        console.log("               to=" + sockTo + "?=" + socket.id);
        console.log("  sta condividendo=" + staCondividendo);
        //console.log("                  ="+message);
        socket.to(sockTo).emit("message-desc", sockFrom, sockTo, message);
    });

    socket.on("message-cand", (sockFrom, sockTo, message) => {
        console.log("message-cand from=" + sockFrom);
        console.log("               to=" + sockTo);
        //console.log("                 ="+message);
        socket.to(sockTo).emit("message-cand", sockFrom, sockTo, message);
    });
});
