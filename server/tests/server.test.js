const expect = require('expect');
const supertest = require('supertest')

const {app} = require('./../server.js')
const {Todo} = require('./../models/todo.js')
const {ObjectID} = require('mongodb')

const todos = [{_id:new ObjectID(),text:'First test to do'},{_id:new ObjectID(),text:'Second test to do'}];

beforeEach((done) =>{
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(()=> done());
})

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
