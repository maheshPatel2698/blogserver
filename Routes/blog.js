const express = require('express')
const blogRouter = express.Router()
const isAdmin = require('../Middleware/isAdmin')
const isVerifiedAdmin = require('../Utils/isVerifiedAdmin')

blogRouter.post('/addblog', isAdmin, async (req, res) => {
    try {

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
    }
})

module.exports = blogRouter