const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const productRoute = require('./api/routes/products')
const orderRoute = require('./api/routes/orders')
const userRoute  = require('./api/routes/user')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://nodeapiusername:' + process.env.MONGO_ATLAS_PW + '@nodeapi-shard-00-00-d5lvi.mongodb.net:27017,nodeapi-shard-00-01-d5lvi.mongodb.net:27017,nodeapi-shard-00-02-d5lvi.mongodb.net:27017/test?ssl=true&replicaSet=nodeapi-shard-0&authSource=admin',
{ useMongoClient: true })

app.use(morgan('dev'))
// app.use(express.static('uploads')) Express 會查閱靜態目錄的相對檔案，因此靜態目錄的名稱不是 URL 的一部分。
app.use('/uploads', express.static(__dirname + '/uploads')); //建立虛擬路徑字首（其中的路徑事實上不存在於檔案系統中）=> /uploads
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  if (req.method === 'OPTIONS') {
    res.header("Access-Control-Allow-Methods", 'GET, PUT, POST, PATCH, DELETE')
    return res.status(200).json({})
  }
  next()
})

app.use('/products', productRoute)
app.use('/orders', orderRoute)
app.use('/user', userRoute)

app.use((req, res, next) => {
  const error = new Error('not found')
  error.status = 404
  next(error) 
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

module.exports = app