const express = require('express')
const router = express.Router()


// GET api/profile
// Public
router.get('/', (req, res) => res.send('profile route'))

module.exports = router