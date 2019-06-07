const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')


// GET api/auth
// Public
router.get('/', auth, (req, res) => res.send('auth route'))

module.exports = router