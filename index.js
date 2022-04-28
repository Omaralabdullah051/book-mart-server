const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

//middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ztcrb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async() => {
    try{
         await client.connect();
         const bookCollection = client.db('inventoryManagement').collection("book");
            
        })

    }
    catch(err){
      console.log(err.message);
    }
}

app.get('/', (req,res)=> {
    res.send('hello!user');
})

app.listen(port, () => {
    console.log(`Listening to the port ${port}`);
})