const express = require('express')
const userRouter = express.Router()
const cloudinary = require('cloudinary')

const encPassword = require('../Utils/encPassword')
const validatePassword = require('../Utils/validatePassword')
const cookietoken = require('../Utils/cookieToken')

const User = require('../Models/User')
const Blog = require('../Models/Blog')

const isUser = require('../Middleware/isUser')


// signup route
userRouter.post('/signup', async (req, res) => {
    try {
        const { full_name, email, password } = req.body
        let photo = {}

        if (!(full_name && email && password)) {
            return res.status(404).json({
                success: false,
                message: "All field required"
            })
        }

        if (req.files) {
            const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
                folder: 'Bloguser'
            })
            photo.secure_id = result.public_id
            photo.secure_url = result.secure_url
        }

        const encPass = await encPassword(req.body.password)
        req.body.photo = photo
        req.body.password = encPass
        const user = await User.create(req.body)
        user.password = undefined

        res.status(201).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
        console.log(error)
    }
})


// login route
userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!(email && password)) {
            return res.status(404).json({
                success: false,
                message: "All field required"
            })
        }
        const user = await User.findOne({ email })
        const isValidated = await validatePassword(password, user.password)

        if (!isValidated) {
            return res.status(400).json({
                success: false,
                message: "Invalid Creds"
            })
        }
        user.password = undefined
        cookietoken(user, res)

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
})

// logout route
userRouter.post('/logout', async (req, res) => {
    try {
        // expiring cookies i
        res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true })
        res.status(200).json({ success: true, message: "Logout Success" })
    } catch (error) {
        res.status(500).json({
            sucess: false,
            message: "Internal Server Error",
            error: error.message
        })
        console.log(error)
    }
})

// profile user
userRouter.get('/profile', isUser, async (req, res) => {
    try {
        const user = await User.findById(req.id)
        if (!user) {
            return res.status(404).json({
                sucess: false,
                message: "No user found"
            })
        }

        user.password = undefined
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {

    }
})


// updateUser
userRouter.put('/update', isUser, async (req, res) => {
    try {
        let photo = {}
        const user = await User.findById(req.id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found'
            })
        }
        if (req.files) {
            await cloudinary.v2.uploader.destroy(user.photo?.secure_id)
            const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
                folder: 'Bloguser'
            })
            photo.secure_id = result.public_id
            photo.secure_url = result.secure_url
        }
        req.body.photo = photo

        const updateUser = await User.findById(req.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            success: true,
            updateUser
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
    }
})

// liked blogs
userRouter.put('/likeblog/:blogid', isUser, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogid)
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'No blog found'
            })
        }
        const isAlreadyLiked = blog.likes.filter((b) => {
            return b.user.toString() === req.id
        })
        if (isAlreadyLiked) {
            return res.status(405).json({
                success: false,
                message: 'Already liked'
            })
        }
        blog.likes.push({
            user: req.id,
            like: 1
        })
        await blog.save()


        res.status(200).json({
            success: true,
            message: 'You Liked Blogs'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Interal Server Error',
            error: error.message
        })
        console.log(error)
    }
})

// dislikepost
userRouter.put('/dislikeblog/:blogid', isUser, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogid)
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'No blog found'
            })
        }
        const isAlreadydisLiked = blog.dislikes.filter((b) => {
            return b.user.toString() === req.id
        })
        if (isAlreadydisLiked) {
            return res.status(405).json({
                success: false,
                message: 'Already disliked'
            })
        }
        blog.dislikes.push({
            user: req.id,
            dislike: 1
        })
        await blog.save()

        res.status(200).json({
            success: true,
            message: 'You disliked Blogs'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Interal Server Error',
            error: error.message
        })
        console.log(error)
    }
})

// addcommennt
userRouter.put('/addcomment/:blogid', isUser, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogid)
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'No blog found'
            })
        }
        const isAlreadyCommented = blog.comments.filter((c) => {
            return c.user.toString() === req.id
        })

        if (isAlreadyCommented) {
            return res.status(405).json({
                success: false,
                message: "Already Commented"
            })
        }
        blog.comments.push({
            user: req.id,
            comment: req.body.comment
        })
        await blog.save()

        res.status(200).json({
            success: true,
            message: 'You commented on Blog',
            comment: req.body.comment
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server',
            error: error.message
        })
    }
})

// updateComment
userRouter.put('/updatecomment/:blogid', isUser, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogid)
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'No blog found'
            })
        }
        const userComment = blog.comments.filter((uc) => {
            return uc.user.toString() === req.id
        })
        if (userComment) {
            userComment[0].comment = req.body.comment
        }
        await blog.save()
        res.status(200).json({
            success: true,
            message: 'Comment Updated',
            comment: req.body.comment
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Interal Server Error',
            error: error.message
        })
        console.log(error)
    }
})

// deleteComment
userRouter.put('/deletecomment/:blogid', isUser, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogid)
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'No blog found'
            })
        }
        const userComment = blog.comments.filter((uc) => {
            return uc.user.toString() === req.id
        })

        const updatedComment = userComment.filter((uc) => {
            uc.user.toString !== req.id
        })
        blog.comments = updatedComment
        await blog.save()

        res.status(200).json({
            success: true,
            message: 'Comment Deleted'
        })

    } catch (error) {
        res.status(500).json({
            success: true,
            message: 'Internal Server Error',
            error: error.message
        })
        console.log(error)
    }
})

// saveblog
userRouter.put('/saveblog/:blogid', isUser, async (req, res) => {

    try {
        const blog = await Blog.findById(req.params.blogid)
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'No blog found'
            })
        }



        const user = await User.findById(req.id)
        const savedBlogs = user.savedBlogs.filter((sb) => {
            return sb.blogId === req.params.blogid
        })

        if (savedBlogs) {
            return res.status(405).json({
                success: false,
                message: "Already Saved"
            })
        }
        user.savedBlogs.push({
            blogId: req.params.blogid
        })
        await user.save()
        res.status(200).json({
            success: true,
            message: "Saved Blog SuccessFully!"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
        console.log(error)
    }
})

userRouter.put('/removesavedblog/:blogid', isUser, async (req, res) => {

    try {
        const blog = await Blog.findById(req.params.blogid)
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'No blog found'
            })
        }
        const user = await User.findById(req.id)

        const updatedSavedBlogs = user.savedBlogs.filter((sb) => {
            return sb.blogId.toString() !== req.params.blogid
        })
        console.log(updatedSavedBlogs)
        user.savedBlogs = updatedSavedBlogs
        await user.save()

        res.status(200).json({
            success: true,
            message: "Saved Blog SuccessFully!"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
        console.log(error)
    }
})

module.exports = userRouter