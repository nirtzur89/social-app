const express = require('express')
const router = express.Router()


// GET api/posts
// Public
router.get('/', (req, res) => res.send('posts route'))

module.exports = router