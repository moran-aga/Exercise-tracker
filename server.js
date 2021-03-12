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
    date: dateFormat(finalDate),
   };
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
 console.log(req.query);

 if (from.toString() === "Invalid Date") {
  from = new Date(-8640000000000000);
 }
 if (to.toString() === "Invalid Date") {
  to = new Date();
 }
 console.log(id, from, to, limit);
 User.findById(id)
  .then((user) => {
   Exercise.find({ userId: id, date: { $gte: from, $lte: to } })
    .then((array) => {
     console.log(array.length);
     if (isNaN(limit)) limit = array.length;
     console.log(limit);
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

//localhost:3000/api/exercise/log?userId=604b51dbd88c806f98a801f9

//Request URL: https://localhost:3000/api/exercise/log?userId=604b476109784d02082c7f54&from=1989-12-31&to=1990-01-03

function dateFormat(dateString) {
 let date = new Date(dateString);
 let year = date.getFullYear();
 let day = date.getDate();
 let month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
 let weekday = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
 }).format(date);
 return `${weekday} ${month} ${day} ${year}`;
}

const listener = app.listen(process.env.PORT || 3000, () => {
 console.log("Your app is listening on port " + listener.address().port);
});
