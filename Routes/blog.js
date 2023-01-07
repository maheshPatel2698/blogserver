const express = require('express')
const blogRouter = express.Router()
const isAdmin = require('../Middleware/isAdmin')
const Admin = require('../Models/Admin')
const Blog = require('../Models/Blog')
const cloudiary = require('cloudinary').v2

// add blog route
blogRouter.post('/addblog', isAdmin, async (req, res) => {
    try {

        let photos = []
        const isAdminVerified = await Admin.findById(req.id)
        if (!isAdminVerified.status === 'Admin') {
            return res.status(403).json({
                success: false,
                message: "Only admin allowed to add blog"
            })
        }
        if (req.files) {
            for (let index = 0; index < req.files.photos.length; index++) {
                const result = await cloudiary.uploader.upload(req.files.photos[index].tempFilePath, {
                    folder: 'Blogphotos'
                })
                photos.push({
                    secure_id: result.public_id,
                    secure_url: result.secure_url
                })

            }
        }
        req.body.photos = photos
        req.body.admin = req.id
        const blog = await Blog.create(req.body)

        res.status(200).json({
            success: true,
            blog
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
    }
})

// update blog
blogRouter.put('/updateblog/:blogid', isAdmin, async (req, res) => {
    try {
        let photos = []
        const isAdminVerified = await Admin.findById(req.id)
        if (!isAdminVerified.status === 'Admin') {
            return res.status(403).json({
                success: false,
                message: "Only admin allowed to add blog"
            })
        }
        const prevBlog = await Blog.findById(req.params.blogid)
        if (!prevBlog) {
            return res.status(404).json({
                success: false,
                message: 'No blog found'
            })
        }
        if (req.files) {
            for (let index = 0; index < prevBlog.photos.length; index++) {
                await cloudiary.uploader.destroy(prevBlog.photos[index].secure_id)
            }
            for (let index = 0; index < req.files.photos.length; index++) {
                const result = await cloudiary.uploader.upload(req.files.photos[index].tempFilePath, {
                    folder: 'Blogphotos'
                })
                photos.push({
                    secure_id: result.public_id,
                    secure_url: result.secure_url
                })
            }
        }
        req.body.photos = photos

        const updateBlog = await Blog.findByIdAndUpdate(req.params.blogid, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            success: true,
            updateBlog
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
    }

})

// delete blog
blogRouter.delete('/deleteblog/:blogid', isAdmin, async (req, res) => {
    try {
        const isAdminVerified = await Admin.findById(req.id)
        if (!isAdminVerified.status === 'Admin') {
            return res.status(403).json({
                success: false,
                message: "Only admin allowed to add blog"
            })
        }
        const prevBlog = await Blog.findById(req.params.blogid)
        if (!prevBlog) {
            return res.status(404).json({
                success: false,
                message: 'No blog Found'
            })
        }
        for (let index = 0; index < prevBlog.photos.length; index++) {
            await cloudiary.uploader.destroy(prevBlog.photos[index].secure_id)
        }

        await Blog.findByIdAndDelete(req.params.blogid)
        res.status(200).json({
            success: true,
            message: 'Blog Deleted'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
    }
})

module.exports = blogRouter