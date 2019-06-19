const express = require('express')
const request = require('request')
const config = require('config')
const router = express.Router()
const auth = require('../../middleware/auth')
const {
    check,
    validationResult
} = require('express-validator/check')

const Profile = require('../../models/Profile')
const User = require('../../models/User')

// GET api/profile/me
//get current user's profile
// Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', 'name', 'avatar')
        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            })
        }
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


// post api/profile
//create and update profile
// Private
router.post('/', [auth,
        [
            check('status', 'status is required').not().isEmpty(),
            check('skills', 'skills required').not().isEmpty()
        ]
    ], async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }

        const {
            id,
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body

        //build profile object
        const profileFields = {}
        profileFields.user = req.user.id

        if (company) profileFields.company = company
        if (website) profileFields.website = website
        if (location) profileFields.location = location
        if (bio) profileFields.bio = bio
        if (status) profileFields.status = status
        if (githubusername) profileFields.githubusername = githubusername

        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }

        //social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube
        if (twitter) profileFields.social.twitter = twitter
        if (facebook) profileFields.social.facebook = facebook
        if (linkedin) profileFields.social.linkedin = linkedin
        if (instagram) profileFields.social.instagram = instagram

        try {
            let profile = await Profile.findOne({
                user: req.user.id
            })

            if (profile) {
                profile = await Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                })
                return res.json(profile)
            }
            profile = new Profile(profileFields)
            await profile.save()
            res.json(profile)

        } catch (err) {
            console.error(err.message)
            res.status(500).send('server error')
        }

    }


)

// get api/profile
//get all profiles
// Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('server eror')

    }
})

// get api/profile/user/:user_id
//get profile by id
// Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar'])

        if (!profile) return res.status(400).json({
            msg: 'Profile not found'
        })

        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('server eror')

    }
})

// DELETE api/profile
//delete profile, user and posts
// Private
router.delete('/', auth, async (req, res) => {
    try {
        //remove profile
        await Profile.findOneAndRemove({
            user: req.user.id
        })
        //remove user
        await User.findOneAndRemove({
            _id: req.user.id
        })
        res.json({
            msg: 'User Deleted'
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('server eror')

    }
})

// PUT api/experience
// edit experience for user's profile
// Private

router.put('/experience', [auth, [
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)

    } catch (error) {
        console.error(err.message)
        res.status(500).send('server error')
    }
})

// DELETE api/profile/experience/:exp_id
// DELETE experience for user's profile
// Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)

    } catch (error) {
        console.error(err.message)
        res.status(500).send('server error')
    }
})

// PUT api/education
// edit education for user's profile
// Private

router.put('/education', [auth, [
    check('degree', 'degree is required').not().isEmpty(),
    check('school', 'School is required').not().isEmpty(),
    check('fieldofstudy', 'field of study is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const {
        school,
        degree,
        fieldofstudy,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)

    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})

// DELETE api/profile/education/:edu_id
// DELETE experience for user's profile
// Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)

    } catch (error) {
        console.error(err.message)
        res.status(500).send('server error')
    }
})

// GET api/profile/github/:username
// get user's github
// Public

router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repost?per_page=5&sort=created:asc&client_id=${config.get('gihubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {
                'user-agent': 'node.js'
            }

        }
        request(options, (error, response, body) => {
            if (error) console.error(error);
            if (response.statusCode !== 200) {
                return res.status(404).json({
                    msg: 'No Github profile found'
                })
            }
            res.json(JSON.parse(body))

        })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server error')
    }
})


module.exports = router