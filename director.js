const fs = require('fs');

let scriptLines = fs.readFileSync('RUR.txt', 'utf-8').split("\n");
while (scriptLines[scriptLines.length-1] == '')
    scriptLines.pop()
let lastLineNum = getLineNumber(scriptLines[scriptLines.length-1]);
let restarting = false;
let actors = { }


const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');
const uri = require('./atlasuri.js').uri;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

let collection;
client.connect((err) => {
    if (err) throw err;
    collection = client.db("arur").collection("arur");
    setInterval(update, 500);
    });


async function update()
    {
    let query = { state: "all" };
    let playState = await collection.findOne(query);
    checkActors(playState.line);
    if (!restarting)
        {
        if (getLineNumber(playState.line) == lastLineNum)
            {
            restarting = true;
            setTimeout(restartPlay, 8000);
            }
        }
    }


function restartPlay()
    {
    let query = { state: "all" };
    let newval = { $set: { line: scriptLines[0], actors: {} } };
    collection.updateOne(query, newval, (err,res) => {
        if (err) { throw err; }
        debugMessage(`restarting play`);
        restarting = false;
        });
    }


function checkActors(line)
    {
    let tokens = line.split(" ");
    let name = tokens[0].substr(0,tokens[0].length-1);
    if (name == 'DIRECTOR')
        {
        actors = {};
        debugMessage('start new act - clear actors');
        }
    else if ((tokens.length > 1) && (tokens[1] == '{ENTER}'))
        {
        actors[name] = 1;
        debugMessage(`${name} entered`);
        }
    else if ((tokens.length > 1) && (tokens[1] == '{EXIT}'))
        {
        actors[name] = 0;
        debugMessage(`${name} exited`);
        }
    let query = { state: "all" };
    let newval = { $set: { actors: actors } };
    collection.updateOne(query, newval, (err,res) => {
        if (err) { throw err; }
        });
    }


function getLineNumber(line)
    {
    let start = line.indexOf('[');
    let end = line.indexOf(']');
    if ((start == -1) || (end == -1)) return 0;
    let s = line.substr(start+1,end-start-1);
    return +s;
    }


function debugMessage(str)
    {
    console.log(str);
    }
