const express = require('express');
var app = express();
const path = require('path');
//const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
const router = express.Router({ mergeParams: true });

// Instantiate Models
const Article = require('../models/articles');
let User = require('../models/user');

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
}).single('myImage');
  
  // Check File Type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
};

// Add Route
router.get('/add', ensureAuthenticated, function(req,res){
    res.render('add_article', {
        title: 'Add Article'
    });
});

// Add Submit POST Route
router.post('/added', upload, function(req,res){
    req.checkBody('title','Title is Required').notEmpty();
    req.checkBody('body','Body is Required').notEmpty();
    req.checkBody('category','Category is Required').notEmpty();
    req.checkBody('date','Date is Required').notEmpty();
    req.checkBody('colour','Colour is Required').notEmpty();

// Get Errors
let errors = req.validationErrors();

    if(errors){
        res.render('add_article', {
            title: 'Add Article',
            errors:errors
        });
    }else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
        article.category = req.body.category;
        article.date = req.body.date;
        article.colour = req.body.colour;
        article.image = req.file.path;

        upload(req, res, (err) => {
            if(err){
              res.render('index', {
                msg: err
              });
            }
        });
        article.save(function(err){
            if(err){
                console.log('This is>> '+err);
                return;
            }else{
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req,res){
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }
        res.render('edit_article', {
        title: 'Edit Article',
        article: article
        });
    });
});

// Update Submit POST Route
router.post('/edit/:id', function(req,res){
let article = {}
article.title = req.body.title;
article.author = req.body.author;
article.body = req.body.body;

let query = {_id:req.params.id}

    Article.update(query, article, function(err){
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

// Delete Article
router.delete('/:id', function(req,res){
    if(!req.user._id){
        res.status(500).send();
    }
        let query =  {_id:req.params.id};
        Article.findById(req.params.id, function(err, article){
            if(article.author != req.user._id){
                res.status(500).send();
            } else {
            Article.deleteOne(query, function(err){
                if(err){
                    console.log(err);
                }
                res.send('Success');
            });
            }
        });
});

// Get Single Article
router.get('/:id', function(req,res){
    Article.findById(req.params.id, function(err, article){
        User.findById(article.author, function(err, user){
            res.render('article', {
                article: article,
                author: user.name,
                image: article.image
            });
        });
    });
});


// Access Control
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please Login');
        res.redirect('/users/login');
    }
}

module.exports = router;