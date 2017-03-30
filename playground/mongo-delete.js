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


  // //deleteMany
  // db.collection('Todos').deleteMany({text: 'Nuevo Todo'}).then((result)=>{
  //   console.log(result);
  // })
  //
  // //deleteOne
  // db.collection('Todos').deleteOne({text: "tu vieja"}).then((result)=>{
  //   console.log(result);
  // })

  //------------------ FIND ONE AND DELETE ----------------//
  //findOneAndDelete - finds Deletes and returns the deleted item
  db.collection('Todos').findOneAndDelete({text: "tu vieja"}).then((result)=>{
    console.log(result);
  })

  db.collection('Todos').findOneAndDelete({_id: new ObjectID('58dd228b7084f705668b7114')}).then((result)=>{
    console.log(JSON.stringify(result, undefined, 2));
  })




  // db.close();
})
