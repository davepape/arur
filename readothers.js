const WebSocket = require('ws')
const url = 'ws://arur.site:7081'
const ws = new WebSocket(url)

ws.onopen = () => {
  console.log('open');
}

ws.onerror = (error) => {
  console.log(`WebSocket error:`); console.log(JSON.stringify(error));
}

ws.onmessage = receiveMessage;


const fs = require('fs');

let otherName = 'DOMIN';

let fulltext = fs.readFileSync('RUR.txt', 'utf-8');
let lines = fulltext.split("\n");
let myLines = [];
let startingLine = true;
let newLineInfo;
let lastCue = lines[0];
for (let i=1; i < lines.length; i++)
    {
    if (!(lines[i].startsWith(otherName+'.')))
        {
        if (startingLine)
            {
            newLineInfo = { cue: lastCue, lines: [] };
            myLines.push(newLineInfo);
            startingLine = false;
            }
        newLineInfo.lines.push(lines[i]);
        }
    else
        {
        lastCue = lines[i];
        startingLine = true;
        }
    }

let curLine = 0, curSubLine = 0;
let sayingLine = false;

setInterval(sayLine, 1000);


function receiveMessage(msg)
    {
    let text = msg.data;
    debugMessage(`heard ${text}`);
    if (!sayingLine)
        {
        if (text == myLines[curLine].cue)
            {
            sayingLine = true;
            debugMessage(`that's my cue!`);
            }
        }
    }

let saidWaiting = false;

function sayLine()
    {
    if (sayingLine)
        {
        debugMessage(`saying ${myLines[curLine].lines[curSubLine]}`);
        ws.send(myLines[curLine].lines[curSubLine]);
        curSubLine++;
        if (curSubLine == myLines[curLine].lines.length)
            {
            curLine = (curLine+1) % myLines.length;
            curSubLine = 0;
            sayingLine = false;
            }
        saidWaiting = false;
        }
    else
        {
        if (!saidWaiting)
            {
            debugMessage(`waiting for ${myLines[curLine].cue}`);
            saidWaiting = true;
            }
        }
    }


function debugMessage(str)
    {
//    console.log(str);
    }
