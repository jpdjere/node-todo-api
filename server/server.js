require('./config/config')

const mongoose = require('./db/db');
const bodyParser = require('body-parser');
const express = require('express');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const {Todo} = require('./models/todo');
const {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;



app.use(bodyParser.json());



/*--------------TO DOS ----------------*/

//Ruta privada: authenticate. Solo podes crear un todo estando logueado
app.post('/todos', authenticate, (req, res) => {

  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  })

  todo.save().then((doc) =>{
    res.send(doc);
  },(e) =>{
    res.status(400).send(e);
  })

})

//Ruta privada: solo trae los to-dos del creador
app.get('/todos', authenticate,  (req,res)=>{
  Todo.find({
    //Solo busco los to-dos creados por el usuario especificado abajo
    _creator: req.user._id
  }).then((todos)=>{
    res.send({todos})
  },(e)=>{
    res.status(400).send(e);
  })
})

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  //Antes de auth, chequeaba solo por id. Ahora necesito que me pasen el id cuyos to-dos quiero
  //ver, pero ademas el id del creador
  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo)=>{
    if(!todo){
      return res.status(404).send();
    }

    res.send(todo);
  }).catch((e)=>{
    res.status(400).send();
  })

})


app.delete('/todos/:id', authenticate, (req,res) => {

  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  //Antes buscaba solo por ID, ahora necesito pasar tambien el _creator
  // Todo.findByIdAndRemove(id).then( (todo) =>{
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then( (todo) =>{
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e)=>{
    res.status(400).send();
  })

})


app.patch('/todos/:id', authenticate, (req, res)=>{

  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  }else{
    body.completed = false;
    body.completedAt = null;
  }

  //Antes buscaba solo por id, ahora necesito el id del creador tambien
  // Todo.findByIdAndUpdate(id, {$set:body}, {new:true}).then((todo)=>{
  Todo.findOneAndUpdate({
    _id:id,
    _creator:req.user._id
  }, {$set:body}, {new:true}).then((todo)=>{
    if(!todo){
      res.status(404).send();
    }
    res.send({todo});
  }).catch((e)=>{
    res.status(400).send();
  })

})



/*-------------- USERS ----------------*/
app.post('/users', (req, res) => {

  var body = _.pick(req.body, ['email', 'password']);

  var user = new User(body);

  user.save().then(() =>{
    // res.send(user);
    //Instead of simply sending the user, use the custom method (does not require params)
    return user.generateAuthToken();
  }).then((token) => {
    //x-auth is a custom header
    //In this case, were using it for JWT tokens
    res.header('x-auth', token).send(user);
  }).catch((e) =>{
    res.status(400).send(e);
  })

})


//Call authenticate as middleware
app.get('/users/me', authenticate, (req,res) => {
  res.send(req.user);
})

//The only way to get a token is on the /users post route, and you can't do that twice
//So we need the following route if you are rejoining the platform.
//Here we are not using the authenticate middleware because we don-t have a token
// we are trying to get one

//POST /users/login {email, password}
app.post('/users/login', (req, res) => {

  var body = _.pick(req.body, ['email', 'password']);

  //If there is no user, the catch statement is triggered
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    })

  }).catch((e) => {
    res.status(400).send();
  })

})

// Call to log out a user. It will require an x-auth (can't log out someonw who isn't logged in)
// It will mean removing the corresponding token from the token array.
// Tthe token won't be have to be sent: we are going to make the route PRIVATE, meaning that you'll
// have to be authenticated in order to send the code
app.delete('/users/me/token', authenticate, (req, res) => {

  //Call an instance method to delete the token (custom created)
  req.user.removeToken(req.token).then(() => {
    //The then() brings no data, we just need to know when it is sucesfully delted
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });

})

app.listen(port, () => {
  console.log('Started server on port '+port);
})

module.exports = {app};
