var express = require('express');
//var bodyParser = require('body-parser');
var app = express();
const cors = require('cors');

app.use(cors());

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended : true}))

const list = [];

app.get('/', function(req, res) {
    res.send('Hello world');
})

app.get('/api/list', function(req, res) {
    res.json(list)
})

app.post('/api/list', function(req, res) {
    const { name , age } = req.body;
    list.push({
        name,
        age
    })
    return res.send('success');
})

app.listen(3000 , (req, res) => {
    console.log('server start');
});