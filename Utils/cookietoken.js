const tokengen = require('./tokengen')



const cookieToken = async (user, res) => {
    const token = await tokengen(user)

    const options = {
        expires: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000
        ),
        httpsOnly: true,
        path: '/'
    }
    user.password = undefined

    res.cookie('token', token, options).json({
        success: true,
        token,
        user
    })
}

module.exports = cookieToken