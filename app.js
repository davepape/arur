const fs = require('fs');
let scriptLines = fs.readFileSync('RUR.txt', 'utf-8').split("\n");
while (scriptLines[scriptLines.length-1] == '')
    scriptLines.pop()
let userData = { text: scriptLines[0] }


const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(startUpdate);

async function startUpdate(err)
    {
    if (err) throw err;
    setInterval(update, 500);
    }

function restartPlay()
    {
    sayLine(0);
    }

let restarted = false;

let lastLineNum = getLineNumber(scriptLines[scriptLines.length-1]);

async function update()
    {
    let collection = await getCollection();
    let query = { state: "all" };
    let playState = await collection.findOne(query);
    userData.text = playState.line;
    let lineNum = getLineNumber(playState.line);
    if (lineNum == lastLineNum)
        {
        if (!restarted)
            {
            setTimeout(restartPlay, 8000);
            restarted = true;
            }
        }
/*
    else
        checkPrompt(lineNum);
*/
    }


let lastCheckedLine = 0;
let missedCount = 0;

async function checkPrompt(lineNum)
    {
    if ((lineNum != 0) && (lineNum == lastCheckedLine))
        {
        missedCount++;
        if (missedCount > 8)
            {
            missedCount = 0;
            lastCheckedLine = (lastCheckedLine + 1) % scriptLines.length;
            sayLine(lastCheckedLine);
            }
        }
    else
        {
        lastCheckedLine = lineNum;
        missedCount = 0;
        }
    }

async function sayLine(lineNum)
    {
    let collection = await getCollection();
    let query = { state: "all" };
    let newval = { $set: { line: scriptLines[lineNum] } };
    await collection.updateOne(query, newval);
    debugMessage(`prompted ${scriptLines[lineNum]}`);
    }

function getLineNumber(line)
    {
    let start = line.indexOf('[');
    let end = line.indexOf(']');
    if ((start == -1) || (end == -1)) return 0;
    let s = line.substr(start+1,end-start-1);
    return +s;
    }

let _db;
async function getCollection()
    {
    if (!_db)
        {
        await client.connect();
        _db = await client.db("arur");
        }
    return _db.collection("arur");
    }



const express = require('express');
let app = express();

app.use(function (req,res,next)
    {
    res.set('Cache-Control','no-store');
    if ((req.headers) && (req.headers.origin))
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    next();
    });
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


function getData(req, res)
    {
    let sendData = {};
    sendData.text = userData.text.substr(0,userData.text.indexOf('['))
    let str = JSON.stringify(sendData);
    res.send(str);
    }

app.get('/getdata', getData);


function cleanupLine(line)
    {
    let s = line.replace(/^[A-Z0-9]*\./,'');  /* remove name from front */
    s = s.replace(/\(_[^)]*_\)/g,'');       /* remove parenthesized stage directions */
    s = s.replace(/\[.*\]$/g,'');           /* remove line # from end */
    return s;
    }

async function getState(req, response)
    {
    let collection = await getCollection();
    let query = { state: new RegExp(req.params.name,'i') };
    collection.findOne(query, (err,result) => {
        if (err) { response.send(err); }
        if (!result)
            result = { action: "in an unknown state", line: "" };
        else
            result.line = cleanupLine(result.line);
        response.send(JSON.stringify(result));
        });
    }
app.get('/getstate/:name', getState);

app.get('/restart', function (req,res) { restartPlay(); res.send("restarted"); });

let server = app.listen(8000, function () { console.log('server started');});

function debugMessage(str)
    {
    console.log(str);
    }
