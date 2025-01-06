var express = require('express');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const cookieSession = require('cookie-session');
var app = express();
const mongoose = require('mongoose');
const user = require('./models/user.js');
const task = require('./models/record');

const db = require('./config/keys').MongoUri;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('mongo db connected'))
  .catch((err) => console.log(err));

app.set('view engine', 'ejs');
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ['mrclean'],
  })
);
app.use(
  express.urlencoded({
    extended: false,
  })
);



app.use(passport.initialize());
app.use(passport.session());
app.use('/css', express.static('views/css'));
app.listen(3000, () => {
  console.log('listening at 3000');
});
app.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});
app.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile'],
  })
);
app.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  res.redirect('/dashboard');
});
app.get('/register', (req, res) => {
  res.render('register');
});
app.post('/register', (req, res) => {
  var {
    name,
    email,
    password,
    cpassword
  } = req.body;
  let errors = [];
  if (!name || !email || !password || !cpassword) {
    errors.push('Please fill in all the fields');
  }
  if (password != cpassword) {
    errors.push('Passwords do not match');
  }
  if (password.length < 6) {
    errors.push('Password Too weak');
  }
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      cpassword,
    });
  } else {
    user
      .findOne({
        email: email,
      })
      .then((User) => {
        if (User) {
          errors.push('Email already exists');
          res.render('register', {
            errors,
            name,
            email,
            password,
            cpassword,
          });
          console.log(errors);
        } else {
          var newUser = new user({
            username: name,
            email: email,
            password: password,
          });
          console.log(newUser);
          newUser.save().then((user) => {
            res.render('register');
          });
        }
      });
  }
});
app.post('/login', (req, res) => {
  passport.authenticate(
    'local', {
      failureRedirect: '/login',
    },
    (err, User, info) => {
      if (err) throw err;
      if (!User) {
        res.render('login', {
          errors: [info.message],
        });
      } else {
        req.logIn(User, (err) => {
          if (err) throw err;
          res.redirect('/');
        });
      }
    }
  )(req, res);
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/log', (req, res) => {
  console.log(req.body);
});
app.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});
app.get('/dashboard', (req, res) => {
  task.find({
    user: req.user.id
  }, (err, data) => {
    if (err) {
      throw err;
    }
    if (req.user) {
      res.render('todo', {
        user: req.user,
        data: data
      });
    } else {
      res.redirect('/login');
    }

  });
});

app.post('/todo', (req, res) => {
  var {
    str
  } = req.body;
  console.log(str);
  if (str != '') {
    var ntask = new task({
      task: str,
      user: req.user.id
    });
    ntask.save((err, json) => {
      if (err) {
        throw err;
      } else {
        console.log('sucesss');
      }
    });
    console.log(ntask);
    res.redirect('/');
  }
});
app.delete('/todo', (req, res) => {
  task.deleteOne({
    task: req.query.item,
    user: req.user.id
  }, (err, data) => {
    if (err) throw err;
    else {
      res.json(data);
    }
  });
});