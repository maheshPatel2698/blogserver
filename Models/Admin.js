const mongoose = require('mongoose')


const adminSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        requried: true
    },
    secret: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Admin'
    }
})



module.exports = mongoose.model('Admin', adminSchema)