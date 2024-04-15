/* Подключение Express и Mongoose через тег script
// Express (пример через CDN):
const scriptExpress = document.createElement('script');
scriptExpress.src = 'https://cdn.jsdelivr.net/npm/express';
document.body.appendChild(scriptExpress);

// Mongoose (пример через CDN):
const scriptMongoose = document.createElement('script');
scriptMongoose.src = 'https://cdn.jsdelivr.net/npm/mongoose';
document.body.appendChild(scriptMongoose);
*/

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoClient    = require('mongodb').MongoClient;
const path = require('path')


const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Подключение к базе данных MongoDB
mongoose.connect('mongodb://localhost:27017/pausedatabase', {

})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  login: {
    type: String,
    unique: true
  },
  phone: String,
  dateOfBirth: Date,
  password: String
}));



// Passport Local Strategy
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false);
      if (!bcrypt.compareSync(password, user.password)) return done(null, false);
      return done(null, user);
    });
  }
));

app.use('/HTML', express.static(path.join(__dirname, 'HTML')))
app.use('/style', express.static(path.join(__dirname, 'style')))
app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/fonts', express.static(path.join(__dirname, 'fonts')))

// Handling successful authentication
app.post('/login', passport.authenticate('local', {
  successRedirect: '/lk',
  failureRedirect: '/login',
  failureFlash: true
}));

// Handling user logout
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

app.get('/', function(req, res) {
  res.sendFile(__dirname+'/HTML/main.html');
});

app.get('/main', function(req, res) {
  res.sendFile(__dirname+'/HTML/main.html');
});

app.get('/news', function(req, res) {
  res.sendFile(__dirname+'/HTML/news.html');
});

app.get('/about', function(req, res) {
  res.sendFile(__dirname+'/HTML/about.html');
});

app.get('/lk', function(req, res) {
  res.sendFile(__dirname+'/HTML/lk.html');
});

app.get('/menu', function(req, res) {
  res.sendFile(__dirname+'/HTML/menu.html');
});

app.get('/contact', function(req, res) {
  res.sendFile(__dirname+'/HTML/contact.html');
});



// Middleware для проверки роли пользователя
function checkRole(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.status(403).send('Доступ запрещен');
    }
  };
}

// Middleware для проверки аутентификации
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Роут для регистрации новых пользователей
app.post('/register', async (req, res) => {
  const { username, login, phone, dateOfBirth, password } = req.body;
  
  // Хеширование пароля
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
      const newUser = new User({
          username,
          login,
          phone,
          dateOfBirth,
          password: hashedPassword
      });
      
      await newUser.save();

      res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Произошла ошибка при регистрации пользователя' });
    }
});

// Роут для страницы меню, доступной только авторизованным пользователям
app.get('/menu', ensureAuthenticated, checkRole('user'), (req, res) => {
  res.send('Здесь находится меню кофейни');
});


app.get('/admin', checkRole('admin'), (req, res) => {
  // Все, что находится здесь, будет доступно только пользователям с ролью 'admin'
  res.sendFile(__dirname + '../HTML/admin.html'); // Отправляем файл 'admin.html' в ответ на запрос
});
// Здесь вы можете добавить другие роуты и middleware по необходимости

const port = 8000;
app.listen(port, () => {
  console.log('We are live on ' + port);
});