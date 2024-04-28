const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// My code
const mongoose = require('mongoose');
const { use } = require('express/lib/application')

mongoose.connect(process.env.MONGO_URI);

app.use(express.urlencoded({extended: true}));

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true}
});
const exerciseSchema = new mongoose.Schema({
  user_id: {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: Date
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.post('/api/users', (req, res) => {
  const name = req.body.username;
  User.findOne({username: name})
  .then(doc => {
    if(doc)
      res.json({username: doc.username, _id: doc._id});
    else {
      new User({username: name}).save()
      .then(nDoc => {
        res.json({username: nDoc.username, _id: nDoc._id});
      }, (err) => {
        res.send(err);
      });
    }
  });
});

app.get('/api/users', (req, res) => {
  User.find().then(users => {
    res.send(users);
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  User.findOne({_id: req.params._id}).then(doc => {
    if(!doc)
      res.json({error: "User does not exist"});
    else {
      var date = req.body.date.trim();
      new Exercise({
        user_id: req.params._id,
        description: req.body.description,
        duration: req.body.duration,
        date: date == '' ? new Date() : new Date(date)
      }).save()
      .then(nDoc => {
        res.json({_id: doc._id, username: doc.username, date: nDoc.date.toDateString(), duration: nDoc.duration, description: nDoc.description});
      }, err => {
        res.send(err);
      })
    }
  })
});

app.get('/api/users/:_id/logs', (req, res) => {
  User.findById(req.params._id)
  .then(user => {
    Exercise.where({user_id: user._id}).countDocuments()
    .then(count => {
      Exercise.find({user_id: user._id})
      .then(docs => {
        let mappedDocs = docs.map(e => ({
          description: e.description,
          duration: e.duration,
          date: e.date.toDateString()
        }));
        res.json({_id: user._id, username: user.username, count: count, log: mappedDocs});
      });
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
