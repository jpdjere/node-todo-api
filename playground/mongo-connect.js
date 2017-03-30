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

  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   completed:false
  // },(error,result) =>{
  //   if(error){
  //     return console.log('Unable to insert document: ', error);
  //   }
  //
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // })

  //Insert new doc into Users (name, age, location)
  db.collection('Users').insertOne({
    name: 'Juan Pablo Djeredjian',
    age:27,
    location:'Buenos Aires'
  }, (error, result) =>{
    if(error){
      return console.log('Unable to insert document: ', error);
    }
    console.log(JSON.stringify(result.ops, undefined, 2));
    }
  )

  db.close();
})
