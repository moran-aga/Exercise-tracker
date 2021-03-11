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

app.get("/", (req, res) => {
 res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", (req, res) => {
 const body = req.body;
 console.log(body);
 const newUser = new User({ username: body.username });
 newUser.save();
 api / exercise / users;
 res.send(newUser);
});

app.get("/api/exercise/users", (req, res) => {
 User.find({})
  .then((users) => res.send(users))
  .catch((err) => console.log(err));
});

app.post("/api/exercise/add", (req, res) => {
 const body = req.body;
 console.log(body);
 const newUser = new User({ username: body.username });
 newUser.save();
 api / exercise / users;
 res.send(newUser);
});
const listener = app.listen(process.env.PORT || 3000, () => {
 console.log("Your app is listening on port " + listener.address().port);
});
