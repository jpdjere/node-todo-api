var env = process.env.NODE_ENV || 'development';
console.log('env ******', env);


//En los casos en que sea Dev o Test hago un JSON de configuracion, que no va a ir a getCantidadDocumentos
//En PROD, en cambio, la configuracion se hace directamente en Heroku, Bluemix, AWS o lo que sea.

if(env === 'development' || env === 'test'){
  var config = require('./config.json');
  //No necesitamos parsearlo, al hacer un require se parsea solo el JSON
  var envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  })
}



//
// if(env === 'development'){
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp'
// }else if(env === 'test'){
//   process.env.PORT = 3000;
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest'
// }
