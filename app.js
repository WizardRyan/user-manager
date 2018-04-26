const express = require('express');
const path = require('path');
const bParse = require('body-parser');
const mongoose = require('mongoose');
const uuidv1 = require('uuid/v1');

const userSchema = mongoose.Schema({
    userName: String,
    email: String,
    age: Number,
    id: String
});

const User = mongoose.model('User', userSchema)

mongoose.connect('mongodb://localhost/users');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
    console.log('successfully connected to mongo');

});

let app = express();

app.use(bParse.json());
app.use(bParse.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

let users;
setUsers();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, resp) => {
    resp.render('users', {users});
});
app.get('/users/:userName', (req, resp) => {
    resp.end(`Their email is: ${(users.filter(user => req.params.userName == user.userName))[0].email}`)
});
app.get('/add', (req, resp) => {
    resp.render('form');
});
app.get('/user-edit/:userId', (req, resp) => {
    resp.render('form', {user: findUserById(req.params.userId)});
});
app.get('/user-delete/:userId', (req, resp) => {
    User.deleteOne({id: req.params.userId})
    .then(() => setUsers())
    .then(() => resp.redirect('/'));
});

app.get('/sort-ascend', (req, resp) => {
    User.find((err, usersDb) => {
        if(err) return console.error(err);
        users = usersDb.sort((a, b) => a.userName > b.userName);
    })
    .then(() => resp.redirect('/'));
});

app.get('/sort-descend', (req, resp) => {
    User.find((err, usersDb) => {
        if(err) return console.error(err);
        users = usersDb.sort((a, b) => a.userName < b.userName);
    })
    .then(() => resp.redirect('/'));
});

app.get('/reload', (req, resp) => {
    setUsers().then(() => resp.redirect('/'));
});

app.post('/create', (req, resp) => {
    let user = new User({
        userName: req.body.name,
        email: req.body.email,
        age: req.body.age,
        id: uuidv1()
    });
    
    user.save((err, user) => {
        if(err) return console.error(err);
        setUsers().then(() => resp.redirect('/'));
    })
});
app.post('/edit/:userId', (req, resp) => {
    User.where({id: req.params.userId}).update({
        age: req.body.age,
        email: req.body.email,
        userName: req.body.name
    })
    .then(() => setUsers())
    .then(() => resp.redirect('/'));
});

app.post('/search', (req, resp) => {
    User.find({userName: req.body.searchInput}, (err, usersDb) => {
        if(err) return console.error(err);
        users = usersDb;
    })
    .then(() => resp.redirect('/'));
});
app.listen(3000, () => console.log('server listening on port 3000'));


function findUserById(id){
    return users.filter(user => id == user.id)[0];
}

function setUsers(obj){
   return User.find(obj, (err, userDb) => {
        if(err) return console.error(err);
        users = userDb;
    });
}