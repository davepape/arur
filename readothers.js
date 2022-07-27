const fs = require('fs');
const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');

const client = new MongoClient(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(main);


let myLines = readOppositeScript('DOMIN')
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
    let collection = await getCollection();
    let query = { state: "all" };
    let newval = { $set: { line: myLines[curLine].lines[curSubLine] } };
    await collection.updateOne(query, newval);
    debugMessage(`said ${myLines[curLine].lines[curSubLine]}`);
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


function readOppositeScript(otherName)
    {
    let fulltext = fs.readFileSync('RUR.txt', 'utf-8');
    let lines = fulltext.split("\n");
    let myLines = [];
    let startingLine = true;
    let newLineInfo;
    let lastCue = lines[0];
    for (let i=1; i < lines.length; i++)
        {
        if (!lines[i].startsWith(otherName+'.'))
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
