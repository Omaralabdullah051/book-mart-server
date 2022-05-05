const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

//middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ztcrb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        const bookCollection = client.db('inventoryManagement').collection("book");
        const imageCollection = client.db('inventoryManagement').collection('image');

        //POST API TO STORE BOOKS INFORMATION
        app.post('/books', async (req, res) => {
            const bookInfo = req.body;
            if (bookInfo.bookName && bookInfo.imgUrl && bookInfo.discription && bookInfo.bookPrice && bookInfo.quantity && bookInfo.supplierName) {
                await bookCollection.insertOne(bookInfo);
                return res.send({ success: true, message: `${bookInfo.bookName} added successfully` });
            }
            res.send({ success: false, message: "Please Insert all the information" });
        })

        //GET API TO GET ALL BOOKS INFORMATION
        app.get('/books', async (req, res) => {
            const cursor = bookCollection.find({});
            const books = await cursor.toArray();
            res.send(books);
        })

        //GET API TO GET SPECIFIC BOOK INFORMATION
        app.get('/books/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await bookCollection.findOne(query);
            res.send(item);
        })

        // PUT API TO UPDATE SPECIFIC BOOK INFORMATION
        app.put('/books/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedQuantity.quantity
                }
            };
            const result = await bookCollection.updateOne(filter, updatedDoc, option);
            res.send(result);
        })

        //DELETE API TO DELETE SPECIFIC BOOK INFORMATION
        app.delete('/books', async (req, res) => {
            const id = req.query.id;
            if (id) {
                const query = { _id: ObjectId(id) };
                const result = await bookCollection.deleteOne(query);
                res.send(result);
            }
        })

    }
    catch (err) {
        console.log(err.message);
    }
}
run()


app.get('/', (req, res) => {
    res.send('hello!user');
})

app.listen(port, () => {
    console.log(`Listening to the port ${port}`);
})