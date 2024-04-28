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

app.post('/api/users', async (req, res) => {
  const name = req.body.username.trim();
  if(name == '')
    res.json({error: "Please enter a username"});
  else {
    const user = await User.findOne({username: name});
    if(user)
      res.json({username: user.username, _id: user._id});
    else {
      const nUser = await new User({username: name}).save();
      res.json({username: nUser.username, _id: nUser._id});
    }
  }
});

app.get('/api/users', async(req, res) => {
  res.send(await User.find());
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const user = await User.findById(req.params._id);
  if(!user)
    res.json({error: "User does not exist"});
  else {
    try {
      let date = req.body.date;
      const exercise = await new Exercise({
        user_id: req.params._id,
        description: req.body.description,
        duration: req.body.duration,
        date: date == '' ? new Date() : new Date(date)
      }).save();
      res.json({_id: user._id, username: user.username, date: exercise.date.toDateString(), duration: exercise.duration, description: exercise.description});
    }
    catch (err) {
      res.send(err);
    }
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  var dateObj = {};
  if(from)
    dateObj['$gte'] = new Date(from);
  if(to)
    dateObj['$lte'] = new Date(to);
  
  const user = await User.findById(req.params._id);
  if (!user)
    res.json({error: "User does not exist"});
  else {
    var excFilter = {user_id: user._id};
    if(from || to)
      excFilter.date = dateObj;
    const exercises = await Exercise.find(excFilter).limit(limit);
    let log = exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }));
    res.json({_id: user._id, username: user.username, count: exercises.length, log});
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
