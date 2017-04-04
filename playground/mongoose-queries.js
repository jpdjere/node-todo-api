const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

var id = '58de9b922a9478091ab0bd2a';

if(!ObjectID.isValid(id){
  console.log('ID not valid');
})

Todo.find({
  _id: id
}).then((todos)=>{
  console.log('Todos: ', todos);
})

Todo.find({
  _id: id
}).then((todo)=>{
  console.log('Todos: ', todo);
})

Todo.findById(id).then((todo)=>{
  if(!todo){
    return console.log("Error retrieving to do");
  }
  console.log('Todo by id: ', todo)
})
