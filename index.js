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

mongoose.connect(process.env.MONGO_URI);

app.use(express.urlencoded({extended: true}));

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true}
});
const exerciseSchema = new mongoose.Schema({
  username: String,
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date: Date,
  user_id: {type: String, required: true}
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.post('/api/users', (req, res) => {
  const name = req.body.username;
  User.findOne({username: name})
  .then((doc) => {
    if(doc)
      res.json({username: doc.username, _id: doc._id});
    else {
      new User({username: name}).save()
      .then((nDoc) => {
        res.json({username: nDoc.username, _id: nDoc._id});
      }, (err) => {
        res.send(err);
      });
    }
  });
});

app.get('/api/users', (req, res) => {
  User.find().then((users) => {
    res.send(users);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
