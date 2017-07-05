
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
  fullURL: urlDatabase[req.params.id]};
  // let fullurl = { urls: req.params.id};
  console.log(urlDatabase[req.params.id]);
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase[shortURL]);

  res.redirect("/urls/"+ shortURL);         // Respond with 'Ok' (we will replace this)
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