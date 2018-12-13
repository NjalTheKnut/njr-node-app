var mongoose = require('mongoose');

//user schema
var UserSchema = mongoose.Schema({
    first_name:{
        type: String,
        required: true
    },
    last_name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    }
});

var User = module.exports = mongoose.model('User', UserSchema);