// Import Express framework
const express = require('express');

// Create an instance of the Express application
const app = express();

// Import Mongoose for MongoDB interaction
const mongoose = require('mongoose');

// Import bcrypt for password encryption
const bcrypt = require('bcrypt');

// Import express-session for managing user sessions
const session = require('express-session');

// Import the User model
const User = require('./models/user');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1/auth_demo')
    .then((result) => {
        console.log('connected to mongodb');
    }).catch((err) => {
        console.log(err);
    });

// Set the view engine and views directory for EJS templates
app.set('view engine', 'ejs');
app.set('views', 'views');

// Use middleware to parse URL-encoded data and manage sessions
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'notasecreet',
    resave: false,
    saveUninitialized: false
}));

// Middleware to check if a user is authenticated
const auth = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    next();
};

// Define routes and their corresponding actions
app.get('/', (req, res) => {
    res.send('Homepage');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findByCredentials(username, password);
    if (user) {
        req.session.user_id = user._id;
        res.redirect('/admin');
    } else {
        res.redirect('/login');
    }
});

app.post('/logout', auth, (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.get('/admin', auth, (req, res) => {
    res.render('admin');
});

app.get('/profile/settings', auth, (req, res) => {
    res.send('Profile Settings: ' + req.session.user_id);
});

// Start the server and listen on port 3001
app.listen(3001, () => {
    console.log('app listening on port http://localhost:3001');
});
