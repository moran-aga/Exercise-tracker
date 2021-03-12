const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
app.use(express.urlencoded());
app.use(cors());
app.use(express.static("public"));

const url =
 "mongodb+srv://orenb99:org05101971@cluster0.nyhgb.mongodb.net/Database?retryWrites=true&w=majority";

mongoose
 .connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
 })
 .then((result) => {
  console.log("connected to MongoDB");
 })
 .catch((error) => {
  console.log("error connecting to MongoDB:", error.message);
 });

const userSchema = new mongoose.Schema({
 username: String,
});
const User = mongoose.model("User", userSchema);

const exerciseSchema = new mongoose.Schema({
 userId: mongoose.Types.ObjectId,
 description: String,
 duration: Number,
 date: {
  type: Date,
  default: new Date(),
 },
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.get("/", (req, res) => {
 res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", (req, res) => {
 const body = req.body;
 const newUser = new User({ username: body.username });
 newUser.save();
 res.send(newUser);
});

app.get("/api/exercise/users", (req, res) => {
 User.find({})
  .then((users) => res.send(users))
  .catch((err) => console.log(err));
});

app.post("/api/exercise/add", (req, res) => {
 const body = req.body;
 let finalDate = body.date;
 if (body.date === "") {
  let date = new Date();
  finalDate = `${date.getFullYear()} ${date.getMonth() + 1} ${
   date.getDate() + 1
  }`;
 }
 const newExercise = new Exercise({
  userId: body.userId,
  description: body.description,
  duration: body.duration,
  date: finalDate,
 });
 newExercise.save();
 User.findById(body.userId)
  .then((user) => {
   let data = {
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    _id: user.id,
   };
   if (finalDate === undefined) {
    data.date = fixDate(newExercise.date);
   } else {
    let date = new Date(finalDate);
    data.date = date.toDateString();
   }
   res.json(data);
  })
  .catch((err) => {
   res.send(err);
  });
});

app.get("/api/exercise/log?:userId?:from?:to?:limit", (req, res) => {
 const id = req.query.userId;
 let from = new Date(req.query.from);
 let to = new Date(req.query.to);
 let limit = Number(req.query.limit);

 if (from.toString() === "Invalid Date") {
  from = new Date(-8640000000000000);
 }
 if (to.toString() === "Invalid Date") {
  to = new Date();
 }
 User.findById(id)
  .then((user) => {
   Exercise.find({ userId: id, date: { $gte: from, $lte: to } })
    .then((array) => {
     if (isNaN(limit)) limit = array.length;
     array = array.slice(0, limit);
     let data = {
      username: user.username,
      _id: user.id,
      log: array,
      count: array.length,
     };
     res.json(data);
    })
    .catch((err) => {
     return console.log(err);
    });
  })
  .catch((err) => {
   return res.send(err);
  });
});

function fixDate(date) {
 let dateString = String(date);
 dateString = dateString.slice(0, 15);
 return dateString;
}

const listener = app.listen(process.env.PORT || 3000, () => {
 console.log("Your app is listening on port " + listener.address().port);
});
