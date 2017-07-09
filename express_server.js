
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(32).substr(2, 6);
}

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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


// app get

app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.get("/urls", (req, res) => {
  let templateVars = {
  username: users[req.cookies['user_id']],
  urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new" , (req, res) => {
  let templateVars = {
    username: users[req.cookies['user_id']]
  }
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: users[req.cookies['user_id']],
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

 // app post

app.post("/urls", (req, res) => {
  if (users.hasOwnProperty(req.cookies['user_id'])) {
    let userID = generateRandomString();
    urlDatabase[userID] = {
      longURL: req.body.longURL,
      user_id: req.cookies['user_id']
    },
    res.redirect('/urls');
  } else {
    res.status(403).send('login/register to create a url')
  }
});

app.post("/urls/:id", (req, res) => {
  let newUrl = req.params.id;
  urlDatabase[newUrl] = {
    longURL : req.body.longURL
  };
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  var urlInDB = urlDatabase[req.params.id];
  if (!urlInDB) {
    res.status(403).send('url does not exists');
  } else {
      var trueOwner = urlInDB.user_id;
      if (req.cookies['user_id'] === trueOwner) {
        delete urlDatabase[req.params.id];
        res.redirect("/urls");
      } else {
        res.status(403).send('You do not have correct access');
      }
    }
});


// check functions

function checkEmail(email) {
  for (let id in users) {
    if (email === users[id].email)
      return true;
  }
  return false;
}

function checkUser(id){
  return !!users[id]
}

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
      password: req.body.password
    };
    res.cookie('user_id', userID);
  };
  res.redirect('/urls')
});

app.post('/login', (req, res) => {
  if (!checkEmail(req.body.email)){
    res.status(403).send('user with that e-mail cannot be found');
  } else {
    for (var user in users) {
      if (users[user].email === req.body.email && users[user].password === req.body.password) {
        res.cookie('user_id', user);
        res.redirect('/urls');
      } else if (users[user].email === req.body.email && users[user].password !== req.body.password){
        res.status(403).send('user password do not match!');
      }
    }
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

