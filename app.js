const express = require('express');
let app = express();

app.use(function (req,res,next) {
    res.set('Cache-Control','no-store');
    next();
    });
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


const fs = require('fs');
let fulltext = fs.readFileSync('RUR.txt', 'utf-8');
let lines = fulltext.split("\n");
let curLine = 1;

let userData = { text: lines[0] }
 
function getData(req, res) {
    let str = JSON.stringify(userData);
    res.send(str);
    }

app.get('/getdata', getData);


if (typeof(PhusionPassenger) != 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
    let server = app.listen('passenger', function () {});
    }
else {
    let server = app.listen(8000, function () { console.log('non-passenger server started');});
    }



const { WebSocket, WebSocketServer } = require('ws');

const httpserver = require('http').createServer();
httpserver.listen(7081);

const wsServer = new WebSocketServer({server: httpserver}, function () { console.log('wsServer started'); });

wsServer.on('connection', newConnection);

function newConnection(ws)
    {
    ws.on('message', function (data) { receiveData(data,ws); });
    ws.send(userData.text, { binary: false});
    }

let lastCue = lines[0];

function receiveData(data,ws)
    {
    userData.text = data.toString();
    if (userData.text == lines[curLine])
        {
        lastCue = userData.text;
        curLine = (curLine+1) % lines.length;
        if (curLine == 0)
            {
            console.log(new Date());
            lastCue = lines[0];
            curLine = 1;
            }
        if (curLine % 100 == 0)
            console.log(`line ${curLine}`);
        }
    broadcast(data, ws);
    }

function broadcast(data, ws)
    {
    wsServer.clients.forEach(function (client) {
        if ((client != ws) && (client.readyState === WebSocket.OPEN)) {
            client.send(data, { binary: false });
            }
        });
    }

setInterval(prompter, 100);

let lastCheckedLine = curLine;
let missedCount = 0;

function prompter()
    {
    if (curLine != lastCheckedLine)
        {
        lastCheckedLine = curLine;
        missedCount = 0;
        }
    else
        {
        missedCount++;
        if (missedCount >= 10)
            {
            console.log(`prompting ${lastCue}`);
            broadcast(lastCue, 0);
            missedCount = 0;
            }
        }
    }
