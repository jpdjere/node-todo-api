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

  db.collection('Todos').find({
    _id:new ObjectID('58dd228b7084f705668b7114')
  }).toArray().then( (docs) => {
    console.log("Todos: ");
    console.log(JSON.stringify(docs, undefined, 2));
  }, (err) =>{
    console.log('Unable to fetch data');
  })

  db.collection('Todos').find().count().then( (count) => {
    console.log(`Todos Count: ${count}`);
  }, (err) =>{
    console.log('Unable to fetch data');
  })

  // db.close();
})
