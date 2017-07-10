const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieSession({
  name: 'session',
  key: ['key1', 'key2 '],
  secret: 'secret keys',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// database of users
let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: 'userRandomID'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    user_id: 'user2RandomID'
  }
};
// contains users infomation
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('password', 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('password', 10)
  }
}
// generate a new string of 6 characters
function generateRandomString() {
  return Math.random().toString(32).substr(2, 6);
}

// function checks users email
function checkEmail(email) {
  for (let id in users) {
    if (email === users[id].email)
      return true;
  }
  return false;
}

// function checks users urls
function urlsForUser(id) {
  let links = {};
  for (var i in urlDatabase) {
    if ( id === urlDatabase[i].user_id) {
      links[i] = urlDatabase[i];
    }
  }
  return links;
}

// app GET method

app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: users[req.session.user_id],
    urlDatabase: urlsForUser(req.session.user_id),
    longURL : req.body.longURL
  }
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
 let templateVars = {
    username: users[req.session.user_id],
    longURL : req.body.longURL
  };
  if(req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.status(403).send('You do not have correct access');
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
     username: users[req.session.user_id],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
   res.render('urls_login');
});

 // app POST method

app.post("/urls", (req, res) => {
 if (users.hasOwnProperty([req.session.user_id])) {
     let userID = generateRandomString()
     urlDatabase[userID] = {
       longURL: req.body.longURL,
       user_id: req.session.user_id
     },
     res.redirect('/urls')
   } else {res.status(403).send('login/register to create a url')};
});

app.post("/urls/:id", (req, res) => {
  var urlInDB = urlDatabase[req.params.id];
  if (!urlInDB) {
    res.status(403).send('403: you must be logged on to edit!');
  } else {
    var editURL = req.body.longURL;
    urlDatabase[req.params.id].longURL = editURL;
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  var urlInDB = urlDatabase[req.params.id];
  if (!urlInDB) {
    res.status(403).send('url does not exists');
  } else {
      var trueOwner = urlInDB.user_id;
      if (req.session.user_id === trueOwner) {
        delete urlDatabase[req.params.id];
        res.redirect("/urls");
      } else {
        res.status(403).send('You do not have correct access');
      }
    }
});

app.post('/register', (req, res) => {
  let userID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Email or password empty');
  } else if (checkEmail(req.body.email)) {
    res.status(400).send('Email already in database')
  } else {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync('password', 10)
    };

    req.session.user["user_id"];
  };
  res.redirect('/urls')
});

app.post('/login', (req, res) => {
  if (!checkEmail(req.body.email)){
    res.status(403).send('user with that e-mail cannot be found');
  } else {
    for (var user in users) {
      if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session.user_id = users[user].id;
        res.redirect('/urls');
      } else if (users[user].email === req.body.email && users[user].password !== req.body.password){
        res.status(403).send('user password do not match!');
      }
    }
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

