const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

//Creating Users ID so I can reference them below both when creating the ID and
//when passing ti to the jwt.sign function in the token property.
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
//Create testing Users. First one has valid auth, the second doesnt
const users = [{
  _id:userOneId,
  email: 'jpdjere@gmail.com',
  password: 'userOnePass',
  tokens:[{
    access:'auth',
    token: jwt.sign({_id:userOneId,access:'auth'},process.env.JWT_SECRET).toString()
  }]
},{
  _id:userTwoId,
  email: 'jen@example.com',
  password: 'userTwopass',
  tokens:[{
    access:'auth',
    token: jwt.sign({_id:userTwoId,access:'auth'},process.env.JWT_SECRET).toString()
  }]
}]

//Create testing ToDos
const todos = [
  {_id:new ObjectID(),text:'First test to do',_creator:userOneId},
  {_id:new ObjectID(),text:'Second test to do', completed:true, completedAt:333,_creator:userTwoId}
];



const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(()=> done());
}

const populateUsers = (done) => {
  //Remove all existing users
  User.remove({}).then(() => {
    //Create variable for user one, from first user in array above. Returns a promise.
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    //Promise.all takes an array of promisesm and only calls then when all
    // promises passes are resolved.
    return Promise.all([userOne, userTwo])
  }).then(() => done());
}

module.exports = {todos, populateTodos, users, populateUsers};
