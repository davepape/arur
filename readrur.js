const WebSocket = require('ws')
const url = 'ws://arur.site:7080'
const ws = new WebSocket(url)

ws.onopen = () => {
  console.log('open');
}

ws.onerror = (error) => {
  console.log(`WebSocket error:`); console.log(JSON.stringify(error));
}

ws.onmessage = (e) => {
  console.log(e.data)
}


const fs = require('fs');

let fulltext = fs.readFileSync('RUR.txt', 'utf-8');
let lines = fulltext.split("\n");
let curline = 0;

let sayLineInterval = setInterval(sayLine, 1000);

function sayLine()
    {
    ws.send(lines[curline]);
    curline++;
    if (curline == lines.length)
        clearInterval(sayLineInterval);
    }
