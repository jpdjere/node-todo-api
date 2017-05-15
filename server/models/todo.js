var mongoose = require('mongoose');

var Todo = mongoose.model('Todo',{
  text: {
    type: String,
    minlength:1,
    required:true,
    trim:true
  },
  completed:{
    type: Boolean,
    default:false
  },
  completedAt:{
    type:Number
  },
  //Uses underscore to show it is an ObjectId
  _creator:{
    //Defino que el type es ObjectId que es especifico de Mongoose
    type:mongoose.Schema.Types.ObjectId,
    required:true,
  }
});

 module.exports = {Todo};
