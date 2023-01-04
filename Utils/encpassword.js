const bcryptjs = require('bcryptjs')


const encpassword = async (password) => {
    const encPass = await bcryptjs.hash(password, 10)
    return encPass

}

module.exports = encpassword