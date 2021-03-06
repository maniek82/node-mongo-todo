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

app.post('/todos',authenticate,(req,res)=> {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
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

app.get('/todos',authenticate,(req,res)=> {
    Todo.find({_creator: req.user._id}).then((todos)=>{
        res.send({todos});
    },(e) => {
        res.status(400).send(e);
    })
});


//GET/todos/345


app.get('/todos/:id',authenticate,(req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
       return res.status(404).send('Invalid id');
    }
    Todo.findOne({
        _id: id, 
        _creator: req.user._id
    }).then((todo)=> {
        if(!todo) {
            return res.status(404).send('No such todo');
        }
        res.send({todo});
    }).catch((e)=>res.status(400).send());
});

//DELETE todos/id
app.delete('/todos/:id',authenticate,(req,res)=> {
    var id = req.params.id;
     if(!ObjectID.isValid(id)) {
       return res.status(404).send('Invalid id');
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo)=>{
        if(!todo) {
            res.status(404).send('Todo not found');
        }
        res.status(200).send({todo});
    }).catch((e)=>res.status(400).send());
});

//PATCH /todos/id
app.patch('/todos/:id',authenticate, (req,res)=> {
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
    Todo.findOneAndUpdate({
        _id:id,
        _creator: req.user._id
    }, {$set:body},{new: true}).then((todo)=> {
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

    res.send(req.user);
});

//POST users/login/ 
app.post('/users/login',(req,res)=> {
    var body = _.pick(req.body,['email','password']);
    User.findByCredentials(body.email,body.password).then((user)=> {
       return user.generateAuthToken().then((token)=> {
            res.header('x-auth',token).send(user);
        })
    }).catch((e)=> {
        res.status(400).send();
    });
});


app.delete('/users/me/token',authenticate,(req,res)=> {
    req.user.removeToken(req.token).then(()=> {
        res.status(200).send();
    },()=> {
        res.status(400).send();
    });
});

const port = process.env.PORT || 3000;

app.listen(port,() => {
    console.log('Server running on port '+port);
    
});



module.exports = {
    app
};


























