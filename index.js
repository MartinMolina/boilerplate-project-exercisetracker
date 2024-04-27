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

const User = mongoose.Model("User", userSchema);
const Exercise = mongoose.Model("Exercise", exerciseSchema);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
