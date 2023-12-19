const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const User = require('../models/user');

//get all users
router.get('/', (req,res,next) => {
    User.find()
    .select("_id login password role")
    .exec()
    .then(docs=>{
        console.log(docs)
        res.status(200).json(docs);
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

//create user
router.post('/create', (req,res,next) => {
    User.find({login : req.body.login})
    .exec()
    .then(user => {
      if(user.length >= 1){
        return res.status(409).json({
            message: "login exists"
        })
      } else {
        bcrypt.hash(req.body.password, 10,(err, hash) => {
            if(err){
                console.log(err)
                return res.status(500).json({
                    error: err
                })
            } else{
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    login: req.body.login,
                    password: hash,
                    role: req.body.role
                })
                user
                .save()
                .then(result => {
                    console.log(result)
                    res.status(201).json({
                        message: "User created"
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error:err
                    })
                })
            }
        })
      }
    })
})

// user authorization
router.post('/login', (req,res,next) => {
    User.find({login: req.body.login}).select("_id login password role").exec().then(user => {
        if(user.length < 1){
            return res.status(401).json({
                message: "Auth failed"
            })
        }
        if(req.body.password == user[0].password){
            return res.status(200).json({
                message: "Auth successful",
                _id: user[0]._id,
                role: user[0].role
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (err,result) => {
            if(err){
                return res.status(401).json({
                    message: "Auth failed"
                })
            }
            if(result){
                return res.status(200).json({
                    message: "Auth successful",
                    _id: user[0]._id,
                })
            }
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
})


//update user data
router.post('/update/:userId', (req,res,next)=>{
    const id = req.params.userId
    User.findByIdAndUpdate(id, {$set : req.body}, {new: true})
    .exec()
    .then(result => {
        console.log(result)
        res.status(200).json(
            result
            )
        })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})


//delete user
router.post('/delete/:userId', (req,res,next) => {
    const id = req.params.userId
    User.findByIdAndRemove(id)
    .exec()
    .then(result => {
        res.status(200).json({
            message: "user deleted"
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
})

// get user by user id
router.post('/:userId', (req,res,next) => {
    const id = req.params.userId
    User.findById(id).select("_id login password role")
    .exec()
    .then(result => {
        console.log(result)
        if(result){
            res.status(200).json({
                _id:result._id,
                login:result.login,
                password:result.password,
                role:result.role
            })
        } else{
            res.status(404).json({message: "so sad"})
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({eror:err})
    })
})





module.exports = router;