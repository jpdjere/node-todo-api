// const MongoClient = require('mongodb').MongoClient;
//Por ES6 Object Decontruction la linea anterior y la siguiente son iguales!
// const {MongoClient} = require('mongodb');

const {MongoClient, ObjectID}  = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) =>{
  if(err){
    return console.log('Unable to connect to MongoDB');
  }
  console.log('Succesfully connectd to MongoDB');


  // //Update one
  // db.collection('Todos').findOneAndUpdate({
  //   _id: new ObjectID('58dd66308eac6087000883c7')
  // },{
  //   $set:{
  //     completed:true
  //   }
  // }, {
  //   //Para que devuelva el objeto modificado y no el original
  //   returnOriginal: false
  // }).then((result)=>{
  //   console.log(result);
  // })

  db.collection('Todos').findOneAndUpdate(
    {
      _id: new ObjectID('58dd66308eac6087000883c7')
    },
    {
      $set:{
        text: "Morirme"
      },
      $inc:{
        age: 1
      }
    },
    {
      //Para que devuelva el objeto modificado y no el original
      returnOriginal: false
    }
  ).then((result)=>{
      console.log(result);
  })




  // db.close();
})
