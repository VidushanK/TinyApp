const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

app.use(express.static('assets'));
app.engine('html', require('ejs').renderFile);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));

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
  for (let i in urlDatabase) {
    if ( id === urlDatabase[i].user_id) {
      links[i] = urlDatabase[i];
    }
  }
  return links;
}

// app GET method

// goes to registeration page
app.get("/", (req, res) => {
const urlInDB = users[req.session.user_id];
  if (!urlInDB) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});
app.get("/register", (req, res) => {
  res.render("urls_registration");
});

// login page
app.get('/login', (req, res) => {
   res.render('urls_login');
});

// goes to url page
app.get("/urls", (req, res) => {
  let templateVars = {
    username: users[req.session.user_id],
    urlDatabase: urlsForUser(req.session.user_id),
    longURL : req.body.longURL
  }
  res.render("urls_index", templateVars);
});

// new link page
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

// page where you can edit your long URL
app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].user_id !== req.session.user_id) {
   res.status(403).send('Error: 403: This is not your link! Please <a href="/"> Go Back </a>');
   return;
 } else {
    let templateVars = {
      username: users[req.session.user_id],
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL
    };
    console.log(templateVars)
    res.render("urls_show", templateVars);
  }
});

// redirects the shortURL to the actual longURL link
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  res.redirect(longURL);
});

 // app POST method
// redirects to /url if you're logged in; else it would send a 403 status code
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

// updates longurl and redirects to /url page
app.post("/urls/:id", (req, res) => {
  const urlInDB = urlDatabase[req.params.id];
  if (!urlInDB) {
    res.status(403).send('403: you must be logged on to edit!');
  } else {
    const editURL = req.body.longURL;
    urlDatabase[req.params.id].longURL = editURL;
    res.redirect("/urls");
  }
});

// the user who created the link, can delete their link;
app.post("/urls/:id/delete", (req, res) => {
  const urlInDB = urlDatabase[req.params.id];
  if (!urlInDB) {
    res.status(404).send('url does not exists');
    return;
  } else {
      const trueOwner = urlInDB.user_id;
      if (req.session.user_id === trueOwner) {
        delete urlDatabase[req.params.id];
        res.redirect("/urls");
        return;
      } else {
        res.status(403).send('You do not have correct access');
        return;
      }
    }
});

// if your email is not on the url database, you can register a new account
app.post('/register', (req, res) => {
  let userID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Email or password empty');
    return;
  } else if (checkEmail(req.body.email)) {
    res.status(400).send('Email already in database')
    return;
  } else {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = userID;
    res.redirect('/urls')
    return;
  }
});

// you can login on your registered account
app.post('/login', (req, res) => {
  for (let user in users) {
    if (!checkEmail(req.body.email)){
      res.status(401).send('user with that e-mail cannot be found');
    }
      if (checkEmail(req.body.email) && bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session.user_id = users[user].id;
        res.redirect('/urls');
        return;
      }
    }
    res.status(401).send('password do not match!');
});

// you can logout, and it will redirect you to /url page
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
