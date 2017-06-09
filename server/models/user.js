const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
    process.env.JWT_SECRET
  ).toString();

  user.tokens.push({access, token});

  //Save the changes
  return user.save().then(() => {
    return token;
  });
}

// Instance method to removeToken, used in the log out route (app.delete('/users/me/token'))
UserSchema.methods.removeToken = function(token){
  //What we want to do is rome any oobject inside the token array (which is inside a user object)
  // that matches the token that is sent to this function

  var user = this;
  //Update method doesnt doesnt take a query, all we do is pass the
  return user.update({
    //$pull is a mongo method that lets you remove objects from an array that meet certain criteria
    // that means the whole object will be removed, not just the token object (inclued id and access)
    $pull:{
      tokens:{
        token: token
      }
    }
  });

};





//.statics is an object that is kind of like methods, but everything you add to it turn
// into a model method instead of an instance method

//Here we are creating the findByToken method to the model
UserSchema.statics.findByToken = function(token){
  var User = this;
  //Note that here we user uppercase: isntance methods get called with the
  //individual document, model methods get called with the model as the 'this' binding
  var decoded;

  try{
    decoded = jwt.verify(token, process.env.JWT_SECRET);
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

//Here we are creating the findByCredentials method to the model, for the POST /users/login route
UserSchema.statics.findByCredentials = function(email, password){

  var User = this;

  return User.findOne({email}).then((user) => {
    if(!user){
      return Promise.reject(); //To trigger the catch clause
    }

    //When a user DOES exist: use bcrypt comapre to compare the password passed with the user.password
    // (Because bcrypt does not support promises, we create a new Promise and use bcrypt inside)
    return new Promise((resolve, reject) => {

      bcrypt.compare(password,user.password,(err,res) => {
        if(res){
          resolve(user);
        }else{
          reject(err);
        }
      })

    })

  })

}



//middleware function that runs everytime before the save action is executed.
// Before we save a document to the database, we want to make sure that the
// hashed password is in place
// El primer argumento 'save', es una opcion de accion de Mongoose Middlware,
// que implica que antes de ese evento, se corre la funcion del segundo argumento
//Las otras opciones son init, validate y remove http://mongoosejs.com/docs/middleware.html

UserSchema.pre('save', function(next){
  var user = this;

  // This is important beacuse there are gonna be times when we save the document
  // and we have never update the password, which means the password will already be hashed
  // If I save a document with a plain string password and it get hashed, and later on
  // I update something that is not the password, this middlware is gonna run again
  // and we are gonna has our hash and the program is gonna break
  if(user.isModified('password')){

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password,salt,(err, hash) => {
        user.password = hash;
        //Recordar que este next va aca adentro, si no no se hace el haseho
        next();
      })
    })


  }else{
    next();
  }
})




var User = mongoose.model('User',UserSchema);

 module.exports = {User};
