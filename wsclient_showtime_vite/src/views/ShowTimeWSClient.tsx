import {useEffect, useState} from "react";
import {ITimeResponse} from "../model/ITimeResponse.ts";
import {IConnectionResponse} from "../model/IConnectionResponse.ts";
import {IErrorResponse} from "../model/IErrorResponse.ts";

export const ShowTimeWSClient = () => {

    const [msgConnection, setMsgConnection] = useState<IConnectionResponse | null>(null);
    const [msgError, setMsgError] = useState<IErrorResponse| null>(null);
    const [msgTime, setMsgTime] = useState<ITimeResponse | null>(null);

    /***** ALLGEMEINE Hilfsfunktionen - verschieben in services/utils.server.ts */

    function isITimeResponse (obj:any):  obj is ITimeResponse {
        const json = JSON.parse(obj);
        const is:boolean =
            typeof json === 'object'
            &&  json !== null
            && 'currenttime' in json
            &&  typeof json.currenttime === 'string'
        console.log("ITimeResponse=",is);

        return is;
    }

    function isIConnectionResponse (obj:any):  obj is IConnectionResponse {
        const json = JSON.parse(obj);
        const is:boolean = typeof json === 'object'
            &&  json !== null
            && 'connect' in json
            && typeof json.connect === 'boolean';
        console.log("IConnectionResponse=", is);

        return is;
    }
    /*ENDE **** ALLGEMEINE Hilfsfunktionen - verschieben in services/utils.server.ts */

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8765');
        //Events für WebSockets Kommunikation
        ws.onopen = () => {
            const msg:string = JSON.stringify({msg:"Hello 5BHIF"})
            ws.send(msg);
        }

        ws.onmessage = (event) => {
            const recieved = event.data;

            console.log("onmessage:recieved=",recieved)            //Handle responses for all different Response Interfaces

            if (isITimeResponse(recieved)) {
                const data: ITimeResponse = recieved;
                console.log("onmessage:time=", data);
                setMsgTime(data);
                return;
            }

            if (isIConnectionResponse(recieved)) {
                const data: IConnectionResponse = recieved;
                console.log("onmessage:connect=", data);
                setMsgConnection(data);
                return;
            }

            // Define an Internal error response object: "Falsches Response Format
            const errorResponse: IErrorResponse = {
                type: "error",
                message: recieved,
                statusCode: 500, //Interner Server Error
                statusText: "Wrong Response Format!"
            };
            console.log("onmessage:recieved=", recieved);

            setMsgError(errorResponse);
        }

    }, []);
    return (
        <>
            <h2>WebSocket Client Showtime</h2>
           Status:  { msgConnection &&
            ` ${(msgConnection)?"Connected":"Not Connected"} `
                     }
            <br />
            Time:
            <br />
            { msgTime &&
                ` ${JSON.stringify(msgTime)} `
            }
            <hr />
            Error:
            { msgError &&
                `${msgError.type}: ${msgError.statusText},..  `}
            <br />

        </>
    );
};