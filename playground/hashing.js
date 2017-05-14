const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken')
var message = 'I am user number 3';

//The result of SHA function is an object, needs to be converted to string
var hash = SHA256(message).toString();
console.log(`Hash: ${hash}`);

var data = {
  id: 4
}

//In order to prevent users to change the data and send it back to us
//what we are actually going to send to a user is a TOKEN, which contains the
//DATA but also a HASH. The hash is going to be the hashed value of the dat.
// If the data changes later on and we rehashed it we arent not going to get the
// same value back  so well be able to know that the data was maniulated by the
// client and we should not expect it to be valid.

//We also need to SALT the hash (add a piece of random string before hashing
// so the user can do the reverse hashing and cheat us)
var token = {
  data: data,
  hash:SHA256(JSON.stringify(data)+ 'somesecret').toString()
}

//Try to change the data
token.data.id = 5;
token.hash = SHA256(JSON.stringify(token.data)).toString();


//We use the exact same salt, but the client doesnt know it
var resultHash = SHA256(JSON.stringify(token.data)+ 'somesecret')

if(resultHash === token.hash){
  console.log('Data was not changed');
}else{
  console.log('Data was changed. Do not trust');
}


//INSTEAD OF DOING ALL THIS BY HAND, WE USE THE JSONWEBTOKEN LIBRARY

var data = {
  id:10
}
//Create a token and send in the data and the salt
var token = jwt.sign(data,'123abc');
console.log(token);
//Check it in jwt.to

var decoded = jwt.verify(token, '123abc');
console.log(decoded);
