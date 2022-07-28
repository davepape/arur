const fs = require('fs');
let scriptLines = fs.readFileSync('RUR.txt', 'utf-8').split("\n");
while (scriptLines[scriptLines.length-1] == '')
    scriptLines.pop()

const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');
const uri = require('./atlasuri.js').uri;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect((err) => { if (err) { throw err; } });

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


async function getData(req, res)
    {
    let collection = await getCollection();
    let query = { state: "all" };
    collection.findOne(query, (err,result) => {
        if (err) { response.send(err); }
        result.line = result.line.substr(0,result.line.indexOf('['));
        res.send(JSON.stringify(result));
        });
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


async function restartPlay(req, response)
    {
    let collection = await getCollection();
    let query = { state: "all" };
    let newval = { $set: { line: scriptLines[0], actors: {} } };
    collection.updateOne(query, newval, (err,result) => {
        response.send("restarted");
        });
    }

app.get('/restart', restartPlay);

let server = app.listen(8000, function () { console.log('server started');});
