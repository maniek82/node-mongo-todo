var express = require("express");
var bodyParser = require("body-parser");

var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");
const {ObjectID} = require("mongodb");

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


const port = process.env.PORT || 3000;
const ip = process.env.IP;
app.listen(port,ip,() => {
    console.log('Server running on port '+port);
    
});



module.exports = {
    app
};

























