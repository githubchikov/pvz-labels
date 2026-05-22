import { WebSocketServer, WebSocket } from 'ws';

import {printLabel} from "./printer.service";
import {
    getPrintConfig
} from '../store/printConfig'


let wss: WebSocketServer | null = null

export function startWSServer() {
    if (wss) return

    wss = new WebSocketServer({
        port: 17373
    })

    console.log('[WS] Server started')

    wss.on('connection', (socket: WebSocket) => {
        console.log('[WS] Client connected');

        socket.on('message', async (message: WebSocket.RawData) => {
            const data = JSON.parse(message.toString());

            console.log('[WS] Message:', data);

            await handleMessage(data);
        });

        socket.on('close', () => {
            console.log('[WS] Client disconnected');
        });
    });
}

async function handleMessage(data: {
    type: string;
    payload: any;
}) {

    switch (data.type) {

        case 'print': {
            const payload = data.payload;
            const config = getPrintConfig();

            if (!config) {
                console.log('[WS] Config not ready, queueing print');
                await handleMessage(data)
                return;
            }

            await printLabel(
                config.printerName,
                config.label,
                payload.text
            );

            break;
        }
    }
}