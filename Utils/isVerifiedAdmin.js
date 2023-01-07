const Admin = require('../Models/Admin')


const isVerifiedAdmin = async (adminid) => {
    try {
        const admin = await Admin.findById(adminid)
        if (!admin) {
            return "No admin found"
        }
        const isVerfied = admin.status === 'Admin'
        return isVerfied
    } catch (error) {
        console.log(error)
    }
}


module.exports = isVerifiedAdmin