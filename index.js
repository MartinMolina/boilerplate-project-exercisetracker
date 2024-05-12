require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

mongoose.connect(process.env.MONGO_URI);

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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});

// front page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// create or fetch user
app.post('/api/users', async (req, res) => {
  const name = req.body.username.trim();
  if(!name || name == '')
    res.json({error: "Please enter a username"});
  else {
    const user = await User.findOne({username: name});
    if(user)
      res.json({username: user.username, _id: user._id});
    else {
      const newUser = await new User({username: name}).save();
      res.json({username: newUser.username, _id: newUser._id});
    }
  }
});

// list all users
app.get('/api/users', async(req, res) => {
  res.send(await User.find());
});

// create an exercise for a user
app.post('/api/users/:_id/exercises', async (req, res) => {
  const user = await User.findById(req.params._id);
  if(!user)
    res.json({error: "User does not exist"});
  else {
    try {
      const date = req.body.date;
      const exercise = await new Exercise({
        user_id: req.params._id,
        description: req.body.description,
        duration: req.body.duration,
        date: (!date || date.trim() == '') ? new Date() : new Date(date.trim())
      }).save();
      res.json({
        _id: user._id,
        username: user.username,
        date: exercise.date.toDateString(),
        duration: exercise.duration,
        description: exercise.description
      });
    }
    catch (err) {
      res.send(err);
    }
  }
});

// fetch a user's exercises
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