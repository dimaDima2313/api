const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storageDisk = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, 'uploads')
    },
    filename: function(req,file,cb){
        cb(null, file.originalname)
    }
})

const fileFilter = (req,file,cb) =>{
    if(file.mimetype === 'image/jpg'|| file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
        cb(null,true)
    } else{
        cb(null,false)
    }
}

const upload = multer(
    {storage: storageDisk, 
    limits: {
    fileSize: 1024 * 1024 * 500
}, 
fileFilter: fileFilter})

const Product = require('../models/product');

// get all products
router.post("/all", (req,res,next) => {
    Product.find().select('_id name description productImage price')
    .exec()
    .then(result => {
        console.log(result)
        res.status(200).json({
            result
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

// get product by product id
router.post('/id/:productId', (req,res,next) => {
    const id = req.params.productId
    Product.findById(id)
    .select('_id name description productImage price')
    .exec()
    .then(result => {
        console.log(result)
        if(result){
            res.status(200).json({
                _id: result._id,
                name: result.name,
                description: result.description,
                productImage: result.productImage,
                price: result.price
            })
        } else {
            res.status(404).json({
                message: "Not found"
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error:err})
    })
})



// create
router.post('/create', upload.single('productImage'), (req,res,next) => {
    console.log(req.file)
    const newProduct = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        productImage: req.file.path.replace("\\","/")
    })
    newProduct
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Product created',
            created: newProduct
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err,
        })
    })
})

// create no image
router.post('/create/noImage', (req,res,next) => {
    const newProduct = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    })
    newProduct
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Product created',
            created: newProduct
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err,
        })
    })
})

//delete
router.post('/delete/:productId', (req,res,next) => {
    const id = req.params.productId
    Product.findByIdAndRemove(id)
    .exec()
    .then(result => {
        res.status(200).json({
            message: "product deleted"
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
})


//update
router.post('/update/:productId', (req,res,next) => {
    const id = req.params.productId
    Product.findByIdAndUpdate(id , {$set: req.body} , {new: true})
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


module.exports = router;
