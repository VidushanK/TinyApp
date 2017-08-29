// dependencies
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const routes = require('./routes/routes');

app.use(express.static('assets'));
app.engine('html', require('ejs').renderFile);
// used for linking css into ejs file
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  key: ['key1', 'key2 '],
  secret: 'secret keys',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
