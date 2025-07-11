const express = require('express');
const WebSocket = require('ws');
const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require('pino');
const path = require('path');

const app = express();
const HTTP_PORT = 3000;
const WS_PORT = 8080;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start HTTP server
const server = app.listen(HTTP_PORT, () => {
    console.log(`HTTP server running on port ${HTTP_PORT}`);
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    let sock;
    let isConnected = false;

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'request_pairing':
                    await handlePairingRequest(ws, data.phoneNumber);
                    break;
                case 'attack':
                    if (isConnected) {
                        await handleAttack(ws, data.attackType, data.targetNumber);
                    } else {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Not connected to WhatsApp'
                        }));
                    }
                    break;
            }
        } catch (error) {
            console.error('Error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message
            }));
        }
    });

    async function handlePairingRequest(ws, phoneNumber) {
        try {
            const { state, saveCreds } = await useMultiFileAuthState('./session');
            
            sock = makeWASocket({
                logger: pino({ level: 'silent' }),
                printQRInTerminal: false,
                auth: state,
                browser: ["Ubuntu", "Chrome", "20.0.04"]
            });
            
            sock.ev.on('creds.update', saveCreds);
            
            sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect } = update;
                
                if (connection === 'open') {
                    isConnected = true;
                    ws.send(JSON.stringify({
                        type: 'connection_update',
                        status: 'connected'
                    }));
                }
                
                if (connection === 'close') {
                    isConnected = false;
                    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                    ws.send(JSON.stringify({
                        type: 'connection_update',
                        status: 'disconnected',
                        reason: reason
                    }));
                }
            });
            
            if (!sock.authState.creds.registered) {
                try {
                    const code = await sock.requestPairingCode(phoneNumber.trim(), "USAMA960");
                    ws.send(JSON.stringify({
                        type: 'pairing_code',
                        code: code
                    }));
                } catch (error) {
                    console.error('Pairing code error:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Failed to generate pairing code: ' + error.message
                    }));
                }
            }
        } catch (error) {
            console.error('Pairing setup error:', error);
            throw error;
        }
    }

    ws.on('close', () => {
        console.log('Client disconnected');
        if (sock) {
            sock.end();
        }
    });
});

console.log(`WebSocket server running on port ${WS_PORT}`);
