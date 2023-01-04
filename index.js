const express = require('express')
const Connection = require('./Db/Connection')
const cloudinary = require('cloudinary').v2
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')
require('dotenv').config()
const { PORT } = process.env
const app = express()
Connection()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

app.get('/', (req, res) => {
    res.status(200).send("Hello  from the home route")
})



app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/"
}))
app.use(express.json())
app.use(cookieParser())
app.use(cors())



app.use('/api/v1/user', require('./Routes/user'))
app.use('/api/v1/admin', require('./Routes/admin'))
app.use('/api/v1/blog', require('./Routes/blog'))

app.listen(PORT, () => {
    console.log(`Server is Runnning at http://localhost:${PORT}`)
})