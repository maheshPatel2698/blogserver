const jwt = require('jsonwebtoken')

const isUser = async (req, res, next) => {

    try {
        const token = req.header('Token') || req.cookies.token
        if (!token) {
            return res.status(403).send("token is missing")
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.id = decode.id

    } catch (error) {
        return res.status(401).send("Invalid token")

    }
    return next()
}


module.exports = isUser