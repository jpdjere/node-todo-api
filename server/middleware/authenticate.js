var {User} = require('./../models/user');

//Define a middleware function to reuse the code in routes like app.get /users/me later
var authenticate = (req,res,next) => {

    var token = req.header('x-auth');
    //req.header let us get the header we want, that was sent (in this case, x-auth)

    User.findByToken(token).then((user) => {
      if(!user){
        //This is the case when there is no user: there is a valid token
        //but the query couldnt find a user that matches
        return Promise.reject();
      }
      //Now we want to modify the request object. That means that we'll be able
      // to use the modified object inside of the route below (/users/me, for example)
      req.user = user;
      req.token = token;
      next();
      //We need to specify next(), otherwise the code in the routes that call it
      //will never execute

    }).catch((e) => {
      res.status(401).send();
    })
}


module.exports = {authenticate};
