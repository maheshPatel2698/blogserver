const jwt = require('jsonwebtoken')


const tokenGen = async (user) => {
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
    )
    return token
}


module.exports = tokenGen