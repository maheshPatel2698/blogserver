const express = require('express')
const adminRouter = express.Router()
const encpassword = require('../Utils/encpassword')
const Admin = require('../Models/Admin')
const validatePassword = require('../Utils/validatePassword')
const cookietoken = require('../Utils/cookieToken')


adminRouter.post('/signupadmin', async (req, res) => {
    try {
        const { full_name, email, password, secret } = req.body

        if (!(full_name && email && password && secret)) {
            return res.status(404).json({
                success: false,
                message: 'All field required'
            })
        }
        const encPass = await encpassword(password)
        const encSecret = await encpassword(secret)

        req.body.password = encPass
        req.body.secret = encSecret

        const admin = await Admin.create(req.body)
        admin.password = undefined
        admin.secret = undefined

        res.status(200).json({
            success: true,
            admin
        })



    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
    }
})

adminRouter.post('/adminlogin', async (req, res) => {
    try {
        const { email, password, secret } = req.body
        if (!(email && password && secret)) {
            return res.status(404).json({
                success: false,
                message: 'All field required'
            })
        }

        const admin = await Admin.findOne({ email })
        const isValidatedPassword = await validatePassword(password, admin.password)
        const isValidatedSecret = await validatePassword(password, admin.secret)

        if (!(isValidatedPassword && isValidatedSecret)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Creds'
            })
        }
        cookietoken(admin, res)

    } catch (error) {
        res.status(500).json({
            success: true,
            message: 'Internal Server Error',
            error: error.message
        })
    }
})

adminRouter.post('/adminlogout', async (req, res) => {
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

module.exports = adminRouter