const express = require('express');
const path = require('path');
const bParse = require('body-parser');

let app = express();

app.use(bParse.json());
app.use(bParse.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

let idCounter = 0;
let users = [{userName: 'Mr.Timn', email: 'TheTimster@Tim.com', age: 34, id: 21212}, {userName: 'JoJo', email: 'IsThatAJoJo@reference.com', age: 22, id:4321}];

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
    for(let i = 0; i < users.length; i++){
        if(users[i].id == req.params.userId){
            users.splice(i, 1);
        }
    }
    resp.redirect('/');
});

app.post('/create', (req, resp) => {
    let user = {
        userName: req.body.name,
        email: req.body.email,
        age: req.body.age,
        id: idCounter++
    };
    users.push(user);
    resp.redirect('/');
});
app.post('/edit/:userId', (req, resp) => {
    for(let i = 0; i < users.length; i++){
        if(users[i].id == req.params.userId){
            users[i].age = req.body.age;
            users[i].email = req.body.email;
            users[i].name = req.body.name;
        }
    }
    resp.redirect('/');
});
app.listen(3000, () => console.log('server listening on port 3000'));

function findUserById(id){
    return users.filter(user => id == user.id)[0];
}