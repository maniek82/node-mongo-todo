require("./config/config");

const _ = require("lodash");
var express = require("express");
var bodyParser = require("body-parser");
const {ObjectID} = require("mongodb");

var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");
var {authenticate} = require("./middleware/authenticate");

var app = express();


app.use(bodyParser.json());

app.post('/todos',(req,res)=> {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc)=> {
        res.send(doc);
    },(e) => {
        res.status(400).send(e);
    });
});

app.get('/',(req,res) => {
    res.send('Working');
});
app.get('/todos',(req,res)=> {
    Todo.find().then((todos)=>{
        res.send({todos});
    },(e) => {
        res.status(400).send(e);
    })
});


//GET/todos/345


app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
       return res.status(404).send('Invalid id');
    }
    Todo.findById(id).then((todo)=> {
        if(!todo) {
            return res.status(404).send('No such todo');
        }
        res.send({todo});
    }).catch((e)=>res.status(400).send());
});
//DELETE todos/id
app.delete('/todos/:id',(req,res)=> {
    var id = req.params.id;
     if(!ObjectID.isValid(id)) {
       return res.status(404).send('Invalid id');
    }
    Todo.findByIdAndRemove(id).then((todo)=>{
        if(!todo) {
            res.status(404).send('Todo not found');
        }
        res.status(200).send({todo});
    }).catch((e)=>res.status(400).send());
});

//PATCH /todos/id
app.patch('/todos/:id', (req,res)=> {
    var id = req.params.id;
    var body =_.pick(req.body,['text','completed']);
    
    if(!ObjectID.isValid(id)) {
        return res.status(404).send('Id not valid');
    }
    
    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();//zwraca timestamp
        
    } else {
      body.completed = false;
      body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id, {$set:body},{new: true}).then((todo)=> {
        if(!todo) {
            return res.status(400).send('No todo found');
        }
        res.send({todo});
    }).catch((e)=> {
        res.status(400).send();
    })
});

//POST USERS
app.post('/users', (req,res)=> {
    var body = _.pick(req.body,['email','password']);
    var user = new User(body);
   
    user.save().then(()=> {
     return user.generateAuthToken();
    }).then((token)=>{
        res.header('x-auth',token).send(user);
    }).catch((e)=> res.status(400).send(e));
});


app.get('/users/me',authenticate,(req,res)=> {
    // var token = req.header('x-auth');
    // User.findByToken(token).then((user)=> {
    //     if(!user) {
    //         return Promise.reject();
    //     }
    //     res.send(user);
    // }).catch((e)=> {
    //     res.status(401).send();
    // });
    //kod powyzej przeniosiony to middleware
    res.send(req.user);
});

const port = process.env.PORT || 3000;
const ip = process.env.IP;
app.listen(port,ip,() => {
    console.log('Server running on port '+port);
    
});



module.exports = {
    app
};


























