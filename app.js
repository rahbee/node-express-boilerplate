var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');

var app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// var logger = function () {
//     console.log('Logging...');
//     next();
// }
//
// app.use(logger);

//Database stuffs
mongoose.connect('mongodb://localhost/customerdb', { useMongoClient: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var User = null;
db.once('open', function() {
    // we're connected!
    console.log('We are connected!!!');

    var userSchema = mongoose.Schema({
        name: String,
        age: Number
    });

    User = mongoose.model('User', userSchema);
});

// var users = [{name : "Rahbee", age : 30}, {name : "Alvee", age : 29}];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.locals.errors = null;
    next();
});
app.use(expressValidator({
    errorFormatter : function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

app.get('/', function (req, res) {
    User.find(function (err, users) {
        console.log(users);

        res.render('index', {
            title : 'Customers',
            users : users
        });
    });
});

app.post('/users/add', function (req, res) {
    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('age', 'Age is required!').notEmpty();

    var errors = req.validationErrors();

    if(errors){

        User.find(function (err, users) {
            console.log(users);

            res.render('index', {
                title : 'Customers',
                users : users,
                errors : errors
            });
        });

    }else{
        var newUser = new User({name : req.body.name, age : req.body.age});
        newUser.save(function (err, user) {
            if (err) return console.error(err);
            // user.speak();
        });
        console.log('Success!');
        res.redirect('/');
    }

    // console.log(req.body.name);
});

app.listen(3000, function (req, res) {
    console.log("Server started on port 3000")
});