const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/signup', (req, res, next) => {
  User.find({ email: req.body.email})
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({ //409衝突
          message: 'the user already exist'
        })
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => { // saltRounds: 在要加密的字串中加特定的字符，打亂原始的字符串，使其生成的散列結果產生變化，其參數越高越安全相對的加密時間就越長。
          if (err) {
            return res.status(500).json({
              error: err
            })
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            })
            user.save()
              .then(result => {
                console.log(result)
                res.status(201).json({
                  message: 'user create'
                })
              })
              .catch(err => {
                console.log(err)
                res.status(500).json({
                  error: err
                })
              })
          }
        })
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})

router.post('/login', (req, res, next) => {
  User.find({email: req.body.email}) //return an array
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        })
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          })
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
          )
          return res.status(200).json({
            message: 'Auth Successful',
            token: token
          })
        }
         res.status(401).json({
           message: "Auth failed"
         })
      })
    })
     .catch(err => {
       console.log(err)
       res.status(500).json({
         error: err
       })
     })
})

router.delete("/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})
module.exports = router