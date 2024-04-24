

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
var router = express.Router();
const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'kulakova',
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
  fullname: String,
  username: {
    type: String,
    unique: true
  },
  phone: String,
  dateOfBirth: Date,
  password: String
}));



// Passport Local Strategy
passport.use(new LocalStrategy(
  async function verify(username, password, done) {
    var myUser = await User.findOne({ username: username }).exec();
    if (myUser) {
      if (!bcrypt.compareSync(password, myUser.password)) {
        return done(null, false); // Неверный пароль
      }
      return done(null, myUser); // Успешная аутентификация
    } else{ 
      return done(null, false) // Пользователь не найден
    }; 
  }
));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


app.use('/HTML', express.static(path.join(__dirname, 'HTML')))
app.use('/style', express.static(path.join(__dirname, 'style')))
app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/img', express.static(path.join(__dirname, 'img')))
app.use('/fonts', express.static(path.join(__dirname, 'fonts')))

app.post('/register', async (req, res) => {
  const { fullname, username, phone, dob, password } = req.body;
  // Хеширование пароля
  const passwordHash = bcrypt.hashSync(password, salt);
  try {
      const newUser = new User({
          fullname: fullname,
          username: username,
          phone: phone,
          dateOfBirth: dob,
          password: passwordHash
      });

      await newUser.save();
      console.log('Пользователь успешно зарегистрирован:', newUser);
      //res.send('Пользователь успешно зарегистрирован');
      var user = {
          fullname: fullname,
          username: username,
          phone: phone,
          dateOfBirth: dob,
          password: passwordHash
      };
      req.logIn(user, (err) => {
        if (err) {
          console.error('Ошибка во время аутентификации пользователя:', err);
          return  res.sendFile(__dirname + '/HTML/errLog.html');
        }
        console.log('Пользователь успешно авторизован:', user.fullname);
        req.session.user = user;
        res.render('lk_auth', { user: req.user });
      });
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
      return res.sendFile(__dirname + '/HTML/errLog.html');
    }
    if (!user) {
      console.log('Пользователь не найден или неверный пароль');
      return res.sendFile(__dirname + '/HTML/errLog.html');
    }
    req.session.user = user;
    res.render('lk_auth', { user: user });
  })(req, res, next);
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/lk_auth', // перенаправление на страницу профиля при успешной аутентификации
  failureRedirect: '/login',  // перенаправление на страницу входа при ошибке 
  failureFlash: true  // активация флеш-сообщений при ошибке аутентификации
}));

router.get('/', function(req, res, next) {
  if (!req.user) { return res.render('/lk'); }
  next();
  res.locals.filter = null;
  res.render('/lk_auth', { user: req.user });
	});


// Handling user logout
app.post('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/'); // Перенаправляем пользователя после выхода
  });
});

app.get('/', function(req, res) {
  if (req.session.user) {
    // Пользователь авторизован
    res.render('main', { user: req.session.user });
  } else {
    // Пользователь не авторизован
    res.sendFile(__dirname + '/HTML/main.html');
  }
});

app.get('/main', function(req, res) {
  if (req.session.user) {
    // Пользователь авторизован
    res.render('main', { user: req.session.user });
  } else {
    // Пользователь не авторизован
    res.sendFile(__dirname + '/HTML/main.html');
  }
});

app.get('/news', function(req, res) {
  if (req.session.user) {
    // Пользователь авторизован
    res.render('news', { user: req.session.user });
  } else {
    // Пользователь не авторизован
    res.sendFile(__dirname + '/HTML/news.html');
  }
});

app.get('/about', function(req, res) {
  if (req.session.user) {
    // Пользователь авторизован
    res.render('about', { user: req.session.user });
  } else {
    // Пользователь не авторизован
    res.sendFile(__dirname + '/HTML/about.html');
  }
});

app.get('/lk', function(req, res) {
  if (req.session.user) {
    // Пользователь авторизован
    res.render('lk_auth', { user: req.session.user });
  } else {
    // Пользователь не авторизован
    res.sendFile(__dirname + '/HTML/lk.html');
  }
});

app.get('/franshiza', function(req, res) {
  if (req.session.user) {
    // Пользователь авторизован
    res.render('franshiza', { user: req.session.user });
  } else {
    // Пользователь не авторизован
    res.sendFile(__dirname + '/HTML/franshiza.html');
  }
});

app.get('/contact', function(req, res) {
  if (req.session.user) {
    // Пользователь авторизован
    res.render('contact', { user: req.session.user });
  } else {
    // Пользователь не авторизован
    res.sendFile(__dirname + '/HTML/contact.html');
  }
});


app.get('/menu', function(req, res) {
  if (req.session.user) {
    // Пользователь авторизован
    res.render('menu_auth', { user: req.session.user });
  } else {
    // Пользователь не авторизован
    res.sendFile(__dirname + '/HTML/menu.html');
  }
});


const port = 8000;
app.listen(port, () => {
  console.log('We are live on ' + port);
});
