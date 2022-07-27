const fs = require('fs');
let lines = fs.readFileSync('RUR.txt', 'utf-8').split("\n");
let curLine = 1;
let userData = { text: lines[0] }


const { MongoClient, ServerApiVersion, ObjectID } = require('mongodb');
const uri = "mongodb+srv://dave:swordfish@cluster0.qbbku6i.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(startUpdate);

async function startUpdate(err)
    {
    if (err) throw err;
    let collection = await getCollection();
    let query = { state: "all" };
    let newval = { $set: { line: lines[0] } };
    await collection.updateOne(query, newval);
    setInterval(update, 1000);
    }

async function update()
    {
    let collection = await getCollection();
    let query = { state: "all" };
    let playState = await collection.findOne(query);
    userData.text = playState.line;
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



function getData(req, res) {
    let sendData = {};
    sendData.text = userData.text.substr(0,userData.text.indexOf('['))
    let str = JSON.stringify(sendData);
    res.send(str);
    }

const express = require('express');
let app = express();

app.use(function (req,res,next) {
    res.set('Cache-Control','no-store');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    next();
    });
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


app.get('/getdata', getData);


require('./cycle.js');

async function getState(req, response)
    {
    let collection = await getCollection();
    let query = { state: new RegExp(req.params.name,'i') };
    collection.findOne(query, (err,result) => {
        if (err) { response.send(err); }
        if (!result)
            result = { action: "in an unknown state", line: "" };
        response.send(JSON.stringify(result));
        });
    }
app.get('/getstate/:name', getState);




let server = app.listen(8000, function () { console.log('server started');});
