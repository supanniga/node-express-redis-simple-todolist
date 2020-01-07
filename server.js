const express = require('express');
const redis = require('redis');
const moment = require('moment');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


let client = redis.createClient();
client.on('connect', () => {
    console.log('Connected to Redis...');
    console.log('__________________________________________');
});


app.get('/', (req, res) => {
    let hashKey = 'todo';
    client.hgetall(hashKey, (err, _data) => {
        if (err) {
            console.log(err)
        } else {
            console.log('All tasks: ')
            console.log(_data)
            let taskLen;
            if (_data === null) {
                taskLen = 0;
                console.log('..........................................')
            } else {
                taskLen = Object.keys(_data).length;
                console.log('..........................................')
            }
            res.render('index', { len: taskLen, tasks: _data })
        }
    });
})


app.post('/task/add/', (req, res) => {
    let hashKey = 'todo';
    let hashField = moment().format('YYYY-MM-DD-hh-mm-ss');
    let hashValue = req.body.newtask;

    if (!hashValue) {
        return res.status(400).send({ error: true, message: 'Please provide task' });
    }

    if (hashValue.trim() === "" || hashValue === undefined) {
        console.log("No Task Added")
        console.log('..........................................')
        res.redirect('/');
    } else {
        client.hset(hashKey, hashField, hashValue, (err, respones) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Add task successfully!`);
                res.redirect('/');
            }
        })
    }
});


app.get('/task/delete/:taskField', (req, res) => {
    let hashKey = 'todo';
    let hashField = req.params.taskField;
    client.hdel(hashKey, hashField, (err, respones) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Delete task successfully!`);
            res.redirect('/');
        }
    });
});


app.post('/task/clear', (req, res) => {
    if (req) {
        client.flushall();
        console.log('Clear all tasks successfully!');
    } else {
        console.log(res)
    }
    res.redirect('/');

})


app.listen(port, () => {
    console.log(`Start server on port ${port}...`)
});