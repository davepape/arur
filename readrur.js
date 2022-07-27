const fs = require('fs');
const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');

const client = new MongoClient(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(main);


let myName = 'DOMIN';
let myLines = readScript();
let curLine = 0, curSubLine = 0;
let sayingLine = false;

function main(err)
    {
    setInterval(update, 1000);
    }


async function update()
    {
    if (sayingLine)
        sayNextLine();
    else
        checkForCue();
    }

async function sayNextLine()
    {
    let theLine = myLines[curLine].lines[curSubLine];
    let collection = await getCollection();
    let query = { state: "all" };
    let newval = { $set: { line: theLine } };
    await collection.updateOne(query, newval);
    setMyState("saying", theLine);
    debugMessage(`said ${theLine}`);
    curSubLine++;
    if (curSubLine == myLines[curLine].lines.length)
        {
        curLine = (curLine+1) % myLines.length;
        curSubLine = 0;
        sayingLine = false;
        }
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
        sayingLine = true;
        debugMessage('heard cue');
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


var _db;
async function getCollection()
    {
    if (!_db)
        {
        await client.connect();
        _db = await client.db("arur");
        }
    return _db.collection("arur");
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
    console.log(str);
    }
