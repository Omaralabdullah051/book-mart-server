const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello!Users. How are you?');
})

module.exports = router;