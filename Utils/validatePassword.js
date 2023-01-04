const bcryptjs = require('bcryptjs')

const validatePassword = async (password, userPass) => {
    return bcryptjs.compare(password, userPass)
}

module.exports = validatePassword