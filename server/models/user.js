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

var User = mongoose.model('User',UserSchema);

 module.exports = {User};
