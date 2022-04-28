const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const bookHandler = require('./routeHandler/bookHandler');
require('dotenv').config();

//middleware
const cors = require('cors');
app.use(cors());
app.use(express.json());

app.use('/book', bookHandler);

app.listen(port, () => {
    console.log(`Listening to the port ${port}`);
})