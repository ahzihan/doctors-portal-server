require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port=process.env.PORT || 5000;
const app=express();


app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kldhy00.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db("doctors_portal").collection("services");
        const bookingCollection = client.db("doctors_portal").collection("booking");

        app.get('/service',async(req,res)=>{
            const query={};
            const cursor= serviceCollection.find(query);
            const services=await cursor.toArray();
            res.send(services);
        });

        app.post('/service',async(req,res)=>{
            const service=req.body;
            const result = await bookingCollection.insertOne(service);
            console.log(service);
            res.send(result);
        })

    }
    finally{

    }

}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Hello Jonogon');
});


app.listen(port,(req,res)=>{
    console.log('Server is Running port: ',port);
});