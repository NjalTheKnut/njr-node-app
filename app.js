var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var mongoose = require('mongoose');
var config = require('./config/database');

mongoose.connect(config.database);
var db = mongoose.connection;

// log db connection success
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// check for db errors
db.on('error', function (err) {
    console.log('MongoDB has encountered the following error(s):\n' + err);
});

// init app
var app = express();

// models
var User = require('./models/user');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parser Middleware
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')))

// Global Vars
app.use(function (req, res, next) {
    res.locals.errors = null;
    next();
});

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

app.use(expressValidator());

app.get('/', function (req, res) {
    User.find(function (err, docs) {
        // docs is an array of all the documents in mycollection
        res.render('index', {
            title: 'Welcome!',
            users: docs
        });
    });
});

app.get('/user', function (req, res) {
    // find everything
    User.find(function (err, docs) {
        // docs is an array of all the documents in mycollection
        res.render('user', {
            title: 'Users',
            users: docs
        });
    });
});

const {
    check,
    validationResult
} = require('express-validator/check');

app.post('/', [
    // username must be an email
    check('first_name', 'First Name is Required!').isLength({
        min: 1
    }),
    // password must be at least 5 chars long
    check('last_name', 'Last Name is Required!').isLength({
        min: 1
    }),
    // email must be valid
    check('email', 'Email Not Valid!').isEmail()
], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        User.find(function (err, docs) {
            // docs is an array of all the documents in mycollection
            res.render('index', {
                title: 'Customers',
                users: docs,
                errors: errors.array()
            });
        });
    } else {
        var newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        };
        //add
        User.insert(newUser, function (err, result) {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        });
    }
});

app.delete('/users/delete/:id', function (req, res) {
    User.remove({
        _id: ObjectID(req.params.id)
    }, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

app.get('/user_add', function (req, res) {
    res.render('user_add', {
        title: 'Add User'
    });
});

app.get('/user/:id', function (req, res) {
    User.findById(req.params.id, function (err, user) {
        res.render('user_profile', {
            user: user
        });
    });
});

app.post('/user_add', function (req, res) {
    var user = new User();
    user.first_name = req.body.first_name;
    user.last_name = req.body.last_name;
    user.email = req.body.email;

    user.save(function (err) {
        if (err) {
            console.log(err);
            return;
        } else {
            res.redirect('/');
        }
    });
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
    console.log('Server Started on Port ' + app.get('port'));
});