const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const {
    check,
    validationResult
} = require('express-validator/check')
const User = require('../../models/User')
const Profile = require('../../models/Profile')
const Post = require('../../models/Post')

// POST api/posts
// create post
// Private
router.post('/', [auth, [check('text', 'Text is required').not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    try {
        const user = await User.findById(req.user.id).select('-password')

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save()
        res.json(post)

    } catch (error) {
        console.error(error.maessage)
        res.status(500).send('server error')

    }
})

// GET api/posts
// get all post
// Private
router.get("/", auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        })
        res.json(posts)
    } catch (error) {
        console.error(error.maessage)
        res.status(500).send('server error')
    }
});

// GET api/posts/:id
// get post by id
// Private
router.get("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({
                msg: 'post not found'
            })
        }
        res.json(post)
    } catch (error) {
        console.error(error.maessage)
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'post not found'
            })
        }
        res.status(500).send('server error')
    }
});

// DELETE api/posts/:id
// remove post
// Private
router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({
                msg: 'post not found'
            })
        }

        //check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'user not authorized'
            })
        }
        await post.remove()

        res.json({
            msg: 'post removed'
        })
    } catch (error) {

        console.error(error.maessage)
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'post not found'
            })
        }
        res.status(500).send('server error')
    }
});

// PUT api/posts/like/:id
// adding like to post
// Private
router.put("/like/:id", auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)

        //check if user already liked this post
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: 'Post already liked'
            })
        }

        post.likes.unshift({
            user: req.user.id
        })

        await post.save()
        res.json(post.likes)

    } catch (error) {
        console.error(error.maessage)
        res.status(500).send('server error')
    }
});

// PUT api/posts/unlike/:id
// adding like to post
// Private
router.put("/unlike/:id", auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)

        //check if user already liked this post
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: 'Post has not yet been liked'
            })
        }

        //get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

        post.likes.splice(removeIndex, 1)

        await post.save()
        res.json(post.likes)

    } catch (error) {
        console.error(error.maessage)
        res.status(500).send('server error')
    }
});

// POST api/posts/comment/:id
// create comment on a post
// Private
router.post('/comment/:id',
    [auth,
        [check('text', 'Text is required').not().isEmpty()]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }

        try {
            const user = await User.findById(req.user.id).select('-password')
            const post = await Post.findById(req.params.id)

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }

            post.comments.unshift(newComment)

            await post.save()
            res.json(post.comments)

        } catch (error) {
            console.error(error.maessage)
            res.status(500).send('server error')

        }
    })

// DELETE api/posts/comment/:id/:comment_id
// delete comment on a post
// Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        //pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id)
        //make sure comment exists
        if (!comment) {
            return res.status(404).json({
                msg: 'comment doesnt exist'
            })
        }
        //check user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'user not authorized'
            })
        }

        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id)

        post.comments.splice(removeIndex, 1)

        await post.save()
        res.json(post.comments)

    } catch (error) {
        console.error(error.maessage)
        res.status(500).send('server error')
    }
});


module.exports = router