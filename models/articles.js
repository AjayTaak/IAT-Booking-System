let mongoose = require('mongoose');

// Articles Scheme
let articleSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    body:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    colour:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: false
    }

});

let Article = module.exports = mongoose.model('Article', articleSchema);