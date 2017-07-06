
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls", (req, res) => {
  let templateVars = {
  username: req.cookies["username"],
  urls: urlDatabase
};

  res.render("urls_index", templateVars);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  // let templateVars = { shortURL: req.params.id,
  // fullURL: urlDatabase[req.params.id]};
  let templateVars = {
  username: req.cookies["username"],
  shortURL: req.params.id,
  fullURL: urlDatabase[req.params.id]};
  // console.log("These are the temp: ",templateVars);
  //  // console.log(urlDatabase[req.params.id]);
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase[shortURL]);

  res.redirect("/urls/"+ shortURL);
});

app.post("/login", (req, res) =>{
  let username = req.body.username;
  console.log(username);
  res.cookie("username", username);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  let username = req.body.username;
  res.clearCookie("username", username);
  res.redirect("/urls");
});

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});