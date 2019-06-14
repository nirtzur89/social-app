const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const {
    check,
    validationResult
} = require('express-validator/check')


const User = require('../../models/User')

// GET api/auth
// Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})
// POST api/auth
//Authenticate user & get token
// Public
router.post('/', [
    check('email', 'email not valid').isEmail(),
    check('password', 'password is required').exists()
], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const {
        email,
        password
    } = req.body

    try {
        //see if user already exists
        let user = await User.findOne({
            email
        })

        if (!user) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid Cradentials'
                }]
            })
        }


        //match email with password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid Cradentials'
                }]
            })
        }

        //return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload,
            config.get('jwtSecret'), {
                expiresIn: 36000000
            },
            (err, token) => {
                if (err) throw err
                res.json({
                    token
                })

            })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('server error')
    }

})

module.exports = router