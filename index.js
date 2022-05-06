const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

//middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(404).send({ message: "Unauthorized access" });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden access" });
        }
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ztcrb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        const bookCollection = client.db('inventoryManagement').collection("book");
        const advantagesCollection = client.db('inventoryManagement').collection('advantages');
        const informationsCollection = client.db('inventoryManagement').collection('informations');
        const membersCollection = client.db('inventoryManagement').collection('members');

        //GET API TO CREATE ACCESS TOKEN TO SEND TO THE CLIENT
        app.get('/login', async (req, res) => {
            const user = req.query;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

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

        //GET API TO GET BOOKS INFORMATION BY VERIFYING JWT AND IMPLEMENTED PAGINATION
        app.get('/getbooks', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const pages = parseInt(req.query.pages);
                const size = parseInt(req.query.size);
                if (pages || size) {
                    const cursor = bookCollection.find({});
                    const books = await cursor.skip(pages * size).limit(size).toArray();
                    res.send({ books, count: await bookCollection.estimatedDocumentCount() });
                }
                else {
                    const cursor = bookCollection.find({});
                    const books = await cursor.toArray();
                    res.send({ books });
                }
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' });
            }
        })

        //GET API TO VERIFY JWT
        app.get('/addinventory', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                res.send({ message: 'success' });
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' });
            }
        })

        //GET API TO GET SPECIFIC BOOK INFORMATION BY ID
        app.get('/books/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await bookCollection.findOne(query);
            res.send(item);
        })

        //GET API TO GET SPECIFIC BOOK INFORMATION BY EMAIL
        app.get('/booksbyemail', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email };
                const cursor = bookCollection.find(query);
                const books = await cursor.toArray();
                res.send(books);
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' });
            }
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

        //GET API TO GET ALL ADVANTAGES INFORMATION
        app.get('/advantages', async (req, res) => {
            const cursor = advantagesCollection.find({});
            const advantages = await cursor.toArray();
            res.send(advantages);
        })

        //GET API TO GET ALL INFORMATIONS
        app.get('/informations', async (req, res) => {
            const cursor = informationsCollection.find({});
            const informations = await cursor.toArray();
            res.send(informations);
        })

        //GET API TO GET ALL MEMBERS
        app.get('/members', async (req, res) => {
            const cursor = membersCollection.find({});
            const members = await cursor.toArray();
            res.send(members);
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