const expect = require('expect');
const supertest = require('supertest')

const {app} = require('./../server.js')
const {Todo} = require('./../models/todo.js')
const {User} = require('./../models/user.js')
const {ObjectID} = require('mongodb')
const {todos, populateTodos, users, populateUsers} = require('./seed/seed')


beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos', ()=>{
  it('should create a new TO DO', (done) =>{
      var text = 'Test todo text';

      supertest(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res)=>{
          expect(res.body.text).toBe(text);
        })
        .end((err, res)=>{
          if(err){
            return done(res);
          }

          Todo.find({text}).then((todos) =>{
            //We added one and expect it to be one
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          }).catch( (e) => {
            done(e);
          })
        })
  })

  it('should not create a to do with invalid data', (done)=>{
    supertest(app)
      .post('/todos')
      .send({})
      .expect(400)
      .expect((res)=>{
        expect(res.body.text).toBe(undefined);
      })
      .end((err, res)=>{
        if(err){
          return done(res);
        }

        Todo.find().then((todos) =>{
          //We added one and expect it to be one
          expect(todos.length).toBe(2);
          done();
        }).catch( (e) => {
          done(e);
        })
      })
  })

})


describe('/GET todos',()=>{

  it('should get all todos', (done)=>{

    supertest(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);

  })


  describe('/GET todos/:id', ()=>{

    it('should return todo doc', (done)=>{
      supertest(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res)=>{
          // console.log(res.body.text);
          expect(res.body.text).toBe(todos[0].text);
        })
        .end(done);
    })

    it('should return 404 if todo not found', (done) =>{
      var hexId = new ObjectID().toHexString();
      supertest(app)
        .get(`/todos/${hexId}`)
        .expect(404)
        .end(done);

    })

    it('should return 404 for non-object ids', (done)=>{
      supertest(app)
        .get(`/todos/124abs`)
        .expect(404)
        .end(done);
    })

  })

})



describe('/DELETE todos/:id', ()=>{

  it('should remove a todo', (done) => {
    var hexId = todos[1]._id.toHexString();

    supertest(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect( (res)=>{
        expect(res.body.todo._id).toBe(hexId);
      })
      .end( (err, res) =>{
        if(err){
          return done(err);
        }

        Todo.findById(hexId).then((todo) =>{
          expect(todo).toNotExist();
          done();
        }).catch( (e)=>{
          done(e);
        })
      })
  })

  it('should return a 404 if Todo not found', (done) => {

    var hexId = new ObjectID().toHexString();
    supertest(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  })

  it('should return a 404 if ObjectID is invalid', (done) => {

    supertest(app)
      .delete(`/todos/124abs`)
      .expect(404)
      .end(done);

  })

})





describe('/PATCH todos/:id', ()=>{

  it('should patch a todo', (done) => {
    var hexId = todos[0]._id.toHexString();
    var text = "This should be the new text";

    supertest(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed:true,
        text
      })
      .expect(200)
      .expect( (res)=>{
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);

  })

  it('should clear completedAt when todo is not completed', (done) => {

    var hexId = todos[1]._id.toHexString();
    var text = "This should be A NEWER text";

    supertest(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed:false,
        text
      })
      .expect(200)
      .expect( (res)=>{
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);


    })

})

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    supertest(app)
      .get('/users/me')
      //Seteo el x-auth al token
      .set('x-auth', users[0].tokens[0].token)
      //Deberia volver un 200
      .expect(200)
      //Creo un Custom expect, dentro de la cual
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return a 401 if not authenticated', (done) => {
    supertest(app)
      .get('/users/me')
      //Deberia volver un 401
      .expect(401)
      //Creo un Custom expect, dentro de la cual
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

})

describe('POST /users', () => {

  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';

    supertest(app)
      .post('/users')
      .send({email,password})
      .expect(200)
      //Creo un Custom expect, dentro de la cual
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      //En vez de terminarlo con done(), meto funcion como parametro que pasa el
      // error, y si hay error lo muestro. Sino, hago pruebas sobre el usuario que devuleve
      .end((err) => {
        if(err){
          return done(err);
        }

        //Hago pruebas sobre el usuario
        User.findOne({email}).then((user) => {
          expect(user).toExist();
          //Espero que el password no sea igual al que definimos arriba,
          //porque deberia estar hasheado
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e))
      });
  });

  it('should return validation errors if request is invalid', (done) => {
    supertest(app)
      .post('/users')
      .send({
        email:'and',
        password:'123'
      })
      //Deberia volver un 400 (tanto email como pass son invalidos)
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    supertest(app)
      .post('/users')
      //Mando un email que ya esta usado (creado en users de prueba) y un pass valido
      .send({
        email:users[0].email,
        password:'123abc!'
      })
      //Deberia volver un 400 (por email ocupado)
      .expect(400)
      .end(done);
  });

})



describe('POST /users/login', () => {

  it('should login user and return auth token', (done) => {

    supertest(app)
      .post('/users/login')
      .send({
        email:users[1].email,
        password: users[1].password
      })
      .expect(200)
      //Check if x-auth header is sent back as token
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        //Check if the user returned has an auth access and the token
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access:'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e))
      })

  });

  it('should reject invalid login', (done) => {

    supertest(app)
      .post('/users/login')
      .send({
        email:users[1].email,
        //Pass in an invalid password
        password: users[1].email + '123randomshit'
      })
      .expect(400)
      //Check if x-auth header is sent back as token
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        //Check if the user returned has an auth access and the token
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e))
      })

  });

})


describe('DELETE /users/me/token', () => {

  it('should remove auth token on logout', (done) => {
    supertest(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err){
          return done(err)
        }
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => {
          done(e);
        })
      })
  })

})
