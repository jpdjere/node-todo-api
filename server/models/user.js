const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
  email:{
    type:String,
    minlength:1,
    require:true,
    trim:true,
    unique:true,
    validate:{
      validator: (value) => {
        return validator.isEmail(value);
      },
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access:{
      type:String,
      require:true
    },
    token:{
      type: String,
      require:true
    }
  }]
})

//We are updating the toJSON function, that defines what is returned when this object
// is transformed to a JSON value. We want to leave out the password and token
UserSchema.methods.toJSON = function(){
  var user = this;
  //toObject() transforms a Mongoose model to a regular js model
  var userObject = user.toObject();

  return _.pick(userObject, ['_id','email'])
}

//I need to use the traditional function constructor beacuse the arrow function
//doesn't bind the THIS keywords
UserSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = 'auth';
  var token = jwt.sign(
    //The object
    {
      _id:user._id.toHexString(),
      access: access
    },
    //The salt
    'abc123'
  ).toString();

  user.tokens.push({access, token});

  //Save the changes
  return user.save().then(() => {
    return token;
  });
}

//.statics is an object that is kind of like methods, but everything you add to it turn
// into a model method instead of an instance method

//Here we are creating the findByToken method to the model
UserSchema.statics.findByToken = function(token){
  var User = this;
  //Note that here we user uppercase: isntance methods get called with the
  //individual document, model methods get called with the model as the 'this' binding
  var decoded;

  try{
    decoded = jwt.verify(token, 'abc123');
  }catch(e){
    // return new Promise((resolve, reject) => {
    //   reject();
    // })
    //That is equivalent to:
    return Promise.reject('Unable to verify the token.')
  }

  //User.findOne will return a promise
  return User.findOne({
    _id: decoded._id,
    //We use quotes to access a subproperty (when we have a dot)
    'tokens.token':token,
    'tokens.access': 'auth'
  })
}

var User = mongoose.model('User',UserSchema);

 module.exports = {User};
