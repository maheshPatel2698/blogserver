const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
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
        required: true
    },
    role: {
        type: String,
        default: 'user',
        required: true
    },
    photo: {
        secure_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    likedBlogs: [
        {
            blogId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Blog'
            }
        }
    ]

})



module.exports = mongoose.model('User', userSchema)