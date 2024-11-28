"use strict";
// WebSocket- Server
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const port = 8765; // TODO: env
const connectedClients = new Set();
/*****Utility Funktionen **************/
function sendAllClients(message) {
    console.log("Server:sendAllClients:message=", message);
    connectedClients.forEach(client => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(message);
        }
    });
}
//WS-Objekt erzeugt - listening auf port 8765
const ws_server = new ws_1.WebSocketServer({ port: port });
console.log("WS-Objekt erzeugt - listening auf port:", port);
// WebSocket-SERVER Event Handler für Client Anfrage für Connection
ws_server.on('connection', (ws, req) => {
    console.log("ws-server: connection");
    connectedClients.add(ws);
    console.log("Anzahl Clients:", connectedClients.size);
    const msg = { connect: true };
    ws.send(JSON.stringify(msg));
    /*** WebSocket-Event Handler für Kommunikation
        **/
    // WebSocket Message: message handling for incoming recieved client messages
    ws.on('message', (message) => {
        console.log("ws-server:message=", JSON.parse(message.toString()));
        const newTime = { 'currenttime': new Date().toString() };
        const msg = JSON.stringify(newTime);
        ws.send(msg);
    });
    // WebSocket Error: Error handling to manage WebSocket Error
    ws.on("error", (error) => {
        console.error("An error occurred with a client connection:", error.message);
        // Define an error response object
        const errorResponse = {
            type: "error",
            message: "An error occurred on the server.",
            statusCode: 500, //Interner Server Error
            statusText: error.message
        };
        // If an errorResponse is provided, send it to the client
        if (errorResponse) {
            ws.send(JSON.stringify(errorResponse));
        }
    });
    // WebSocket Close: Close handling to manage disconnected clients
    ws.on('close', () => {
        connectedClients.delete(ws);
        console.log("Client disconnected!");
    });
});
