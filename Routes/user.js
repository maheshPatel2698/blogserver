const express = require('express')
const userRouter = express.Router()
const cloudinary = require('cloudinary')
const encPassword = require('../Utils/encPassword')
const validatePassword = require('../Utils/validatePassword')
const cookietoken = require('../Utils/cookieToken')
const User = require('../Models/User')
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



module.exports = userRouter