

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoClient    = require('mongodb').MongoClient;
const path = require('path')
const salt = bcrypt.genSaltSync(10);

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
  function(login, password, done) {
    User.findOne({ login: login }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false); // Пользователь не найден
      if (!bcrypt.compareSync(password, user.password)) return done(null, false); // Неверный пароль
      return done(null, user); // Успешная аутентификация
    });
  }
));

app.use('/HTML', express.static(path.join(__dirname, 'HTML')))
app.use('/style', express.static(path.join(__dirname, 'style')))
app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/fonts', express.static(path.join(__dirname, 'fonts')))

app.post('/register', async (req, res) => {
  // console.log(req.body);
  // res.status(200).send('name is '+req.body.name);
  const { name, reglogin, phone, dob, password } = req.body;
  // Хеширование пароля
  const passwordHash = bcrypt.hashSync(password, salt);
  try {
      const newUser = new User({
          username: name,
          login: reglogin,
          phone: phone,
          dateOfBirth: dob,
          password: passwordHash
      });

      await newUser.save();
      console.log('Пользователь успешно зарегистрирован:', newUser);
      //res.send('Пользователь успешно зарегистрирован');
      res.sendFile(__dirname + '/HTML/lk_auth.html');
  } catch (err) {
      res.sendFile(__dirname + '/HTML/errReg.html');
  }
});

// Handling successful authentication
app.post('/login', (req, res, next) => {
  console.log('Start /login route');
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Произошла ошибка во время аутентификации:', err);
      return res.sendFile(__dirname + '/HTML/errReg.html');;
    }
    if (!user) {
      console.log('Пользователь не найден или неверный пароль');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Ошибка во время аутентификации пользователя:', err);
        return  res.sendFile(__dirname + '/HTML/errReg.html');;
      }
      console.log('Пользователь успешно авторизован:', user.username);
      return res.redirect('/lk');
    });
  })(req, res, next);
});

// Handling user logout
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/lk');
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
  if (req.session.authenticated) {
    res.sendFile(__dirname + '/HTML/lk_auth.html');
} else {
    res.sendFile(__dirname + '/HTML/lk.html');
}
});

app.get('/franshiza', function(req, res) {
  res.sendFile(__dirname+'/HTML/franshiza.html');
});

app.get('/contact', function(req, res) {
  res.sendFile(__dirname+'/HTML/contact.html');
});


app.get('/menu', function(req, res) {
  if (req.session.authenticated) {
    res.sendFile(__dirname + '/HTML/menu_auth.html');
} else {
    res.sendFile(__dirname + '/HTML/menu.html');
}
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
