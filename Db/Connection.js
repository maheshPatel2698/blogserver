const mongoose = require('mongoose')

const Connection = () => {
    mongoose.connect(process.env.MONGO_URI, () => {
        console.log("Db Connected !")
    })
}


module.exports = Connection