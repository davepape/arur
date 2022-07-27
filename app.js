const express = require('express');
let app = express();

app.use(function (req,res,next) {
    res.set('Cache-Control','no-store');
    next();
    });
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


/*
const fs = require('fs');
let fulltext = fs.readFileSync('RURscript_act1.txt', 'utf-8');
let lines = fulltext.split("\n");
let curline = 0;
*/

let userData = { text: 'hello' }
 
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
httpserver.listen(7080);

const wsServer = new WebSocketServer({server: httpserver}, function () { console.log('wsServer started'); });

wsServer.on('connection', newConnection);

function newConnection(ws) {
    ws.on('message', function (data) { receiveData(data,ws); });
    }

function receiveData(data,ws) {
    userData.text = data.toString();
    wsServer.clients.forEach(function (client) {
        if ((client != ws) && (client.readyState === WebSocket.OPEN)) {
            client.send(data, { binary: false });
            }
        });
    }
