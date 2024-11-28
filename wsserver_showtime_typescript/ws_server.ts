// WebSocket- Server

import {WebSocketServer, WebSocket} from "ws";
import * as http from "node:http";
import {ITimeResponse} from "./src/model/ITimeResponse";
import {IConnectionResponse} from "./src/model/IConnectionResponse";
import {IErrorResponse} from "./src/model/IErrorResponse";

const port = 8765; // TODO: env
const connectedClients = new Set<WebSocket>();

/*****Utility Funktionen **************/
function sendAllClients(message:string) {

    console.log("Server:sendAllClients:message=" , message);
    connectedClients.forEach( client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });

}

//WS-Objekt erzeugt - listening auf port 8765
const ws_server = new WebSocketServer( {port: port});
console.log("WS-Objekt erzeugt - listening auf port:", port);

// WebSocket-SERVER Event Handler für Client Anfrage für Connection
ws_server.on ( 'connection', (ws:WebSocket, req: http.IncomingMessage) => {
    console.log("ws-server: connection");

    connectedClients.add(ws);
    console.log("Anzahl Clients:", connectedClients.size);

    const msg:IConnectionResponse = { connect: true };
    ws.send(JSON.stringify(msg));

    /*** WebSocket-Event Handler für Kommunikation
        **/

    // WebSocket Message: message handling for incoming recieved client messages
    ws.on('message', (message) => {
        console.log("ws-server:message=", JSON.parse(message.toString()));
        const newTime: ITimeResponse =
                        { 'currenttime' : new Date().toString()};
        const msg:string = JSON.stringify(newTime);
        ws.send(msg);
        }
    );

    // WebSocket Error: Error handling to manage WebSocket Error
    ws.on("error", (error: Error): void => {
        console.error("An error occurred with a client connection:", error.message);
        // Define an error response object
        const errorResponse: IErrorResponse = {
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


})