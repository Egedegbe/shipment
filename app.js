const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const flash = require('connect-flash');
const session = require("express-session");
const methodOverride = require("method-override");
require('dotenv').config(); // Make sure this is the first import to load environment variables
const Users = require('./model/user'); // Assuming this is a Mongoose model

const app = express();

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key", // Use environment variable for secret
    resave: false, // Set to false to avoid resaving unchanged sessions
    saveUninitialized: false // Set to false to avoid creating sessions for unauthenticated users
  })
);
app.use(flash());

app.use(methodOverride("_method")); // For supporting HTTP verbs such as PUT or DELETE
app.set('views', path.join(__dirname, 'views'))
app.set("view engine", "ejs"); // Set view engine to EJS
app.use(express.static("public")); // Serve static files from "public" directory
app.use(fileUpload()); // For handling file uploads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Connect to MongoDB
const db = 'mongodb+srv://runo001:Makaveli15@makaveli.h1bljcw.mongodb.net/Work?retryWrites=true&w=majority&appName=makaveli';

mongoose.connect(db)
  .then(() => {
    app.listen(3000, () => {
      console.log("Listening for requests on port 3000");
    });
  })
  .catch((error) => console.log(error));

  app.use((req, res, next) => {
    res.locals.successMessage = req.flash("success_msg");
    res.locals.errorMessage = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
  });
// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/logintosite');
  }
}

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // console.log(username, password);

  try {
    // Fetch user from the database using async/await
    const user = await Users.findOne({ username }).exec();

    if (user && user.password === password) { // Hash password comparison in production
      req.session.user = user; // Save user in session
      res.redirect('/admin/admin_dashboard'); // Redirect to dashboard
    } else {
      // console.log('Invalid credentials');
      res.redirect('back'); // Redirect back to login if authentication fails
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Redirect to the home page or login page
    res.redirect('/');
  });
});


// Route handlers
const indexRoutes = require("./server/index_routes");
const adminRoutes = require('./server/admin_routes');

app.use("/", indexRoutes);
app.use('/admin', requireAuth, adminRoutes); // Protect admin routes with authentication

