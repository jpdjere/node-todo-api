const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/db');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result) =>{
//   console.log(result);
// })

// Todo.findOneAndRemove()

Todo.findByIdAndRemove('5906d9141103164f116a90c4').then((todo) => {
  console.log(todo)
})
