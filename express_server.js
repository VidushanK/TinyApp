
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    fullURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
   res.render('urls_login');
});

 // app post

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase[shortURL]);

  res.redirect("/urls/"+ shortURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

function checkEmail(email) {
  for (let id in users) {
    if (email === users[id].email)
      return true;
  }
  return false;
}

app.post('/register', (req, res) => {
  let userID = generateRandomString();
  const {password, email, name} = req.body;
  const check = checkEmail(email)
  if (email == false) {
    res.send('Error 400: Enter a valid username and password.')
  } else if (check) {
    res.send('Error 400: The username you have entered already exists.')
  } else {
      users[userID] = {
        id: userID,
        name,
        email,
        password
      };
      res.cookie('user_id', userID);
      console.log(users);
      res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  for (var user in users) {
    if (users[user].email == req.body.email && users[user].password == req.body.password) {
         res.cookie('user_id', user);
         res.redirect('/urls');
         return;
       }
   }
   res.redirect('/urls');
 });

app.post('/logout', (req, res) => {
   res.clearCookie('username');
   res.redirect('/login');
  });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

