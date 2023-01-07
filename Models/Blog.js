const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    photos: [
        {
            secure_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        }
    ],
    content: {
        type: String,
        required: true
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            comment: {
                type: String
            }
        }
    ],
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            like: {
                type: Number,
                default: 0
            }
        }
    ],
    dislikes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            dislike: {
                type: Number,
                default: 0
            }
        }
    ]
})



module.exports = mongoose.model('Blog', blogSchema)