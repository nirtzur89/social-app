const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const {
    check,
    validationResult
} = require('express-validator/check')

const User = require('../../models/User')

// POST api/users
// Public
router.post('/', [check('name', 'name is required').not().isEmpty(), check('email', 'email not valid').isEmail(), check('password', 'password must be longer then 6 characters').isLength({
    min: 6
})], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const {
        name,
        email,
        password
    } = req.body

    try {
        //see if user already exists
        let user = await User.findOne({
            email
        })

        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: 'User already exists'
                }]
            })
        }
        //get gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        //encrypt pass

        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password, salt)
        await user.save()

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