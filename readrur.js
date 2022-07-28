const fs = require('fs');
const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');

const uri = require('./atlasuri.js').uri;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(main);

let myName = (process.argv.length > 2) ? process.argv[2] : 'DOMIN';
let debugMode = (process.argv.length > 3) ? process.argv[3] : false;
let myLines = readScript();
let curLine = 0;
let state = 'waiting';  // 'waiting', 'starting', or 'saying'

function main(err)
    {
    setInterval(update, 1000);
    }


async function update()
    {
    if (state == 'waiting')
        checkForCue();
    else if (state == 'starting')
        sayNextLine([...myLines[curLine].lines]);
/*  else pass; */
    }

async function checkForCue()
    {
    debugMessage(`waiting for ${myLines[curLine].cue}`);
    setMyState("waiting for my next cue", "");
    let collection = await getCollection();
    let query = { state: "all" };
    let playState = await collection.findOne(query);
    debugMessage(`heard ${playState.line}`);
    if (playState.line == myLines[curLine].cue)
        {
        state = 'starting';
        debugMessage('heard cue');
        }
    }

async function sayNextLine(phrases)
    {
    state = 'saying';
    let phrase = phrases.shift();
    let collection = await getCollection();
    let query = { state: "all" };
    let newval = { $set: { line: phrase } };
    await collection.updateOne(query, newval);
    setMyState("saying", phrase);
    debugMessage(`said ${phrase}`);
    if (phrases.length > 0)
        {
        setTimeout(()=>{sayNextLine(phrases);}, 1000);
        }
    else
        {
        curLine = (curLine+1) % myLines.length;
        state = 'waiting';
        }
    }

async function setMyState(myAction,theLine)
    {
    let collection = await getCollection();
    let query = { state: myName };
    let newval = { $set: { state: myName, action: myAction, line: theLine } };
    const options = { upsert: true };
    collection.updateOne(query, newval, options);
    }


let _collection;
async function getCollection()
    {
    if (!_collection)
        {
        await client.connect();
        _collection = await client.db("arur").collection("arur");
        }
    return _collection;
    }


function readScript()
    {
    let fulltext = fs.readFileSync('RUR.txt', 'utf-8');
    let lines = fulltext.split("\n");
    let myLines = [];
    let startingLine = true;
    let newLineInfo;
    let lastCue = lines[0];
    for (let i=1; i < lines.length; i++)
        {
        if (lines[i].startsWith(myName+'.'))
            {
            if (startingLine)
                {
                newLineInfo = { cue: lastCue, lines: [] };
                myLines.push(newLineInfo);
                startingLine = false;
                }
            if (lines[i] != '')
                newLineInfo.lines.push(lines[i]);
            }
        else
            {
            lastCue = lines[i];
            startingLine = true;
            }
        }
    return myLines;
    }


function debugMessage(str)
    {
    if (debugMode) console.log(str);
    }
