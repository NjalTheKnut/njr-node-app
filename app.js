var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('njr-node-app', ['users']);
var ObjectID = mongojs.ObjectID;
var app = express();

/*
var logger = function(req, res, next){
    console.log('Logging...');
    next();
}

app.use(logger);
*/

app.set('port', process.env.PORT || 3000);

/* var server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-type', '');
    res.render(app);
    res.end();
}); */



// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')))

// Global Vars

app.use(function (req, res, next) {
    res.locals.errors = null;
    next();
});

app.use(expressValidator());



app.get('/', function (req, res) {
    // find everything
    db.users.find(function (err, docs) {
        // docs is an array of all the documents in mycollection
        res.render('index', {
            title: 'NJR-Node-App',
            users: docs
        });
    })
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
        db.users.find(function (err, docs) {
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
        db.users.insert(newUser, function (err, result) {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        });
    }
});

app.delete('/users/delete/:id', function (req, res) {
    db.users.remove({
        _id: ObjectID(req.params.id)
    }, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});


app.listen(app.get('port'), function () {
    console.log('Server Started on Port ' + app.get('port'));
});