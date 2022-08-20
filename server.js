const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('./helpers');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'PasswordKeepR',
  keys: ['key']
})
);

app.set("view engine", "ejs");
app.use("/styles", express.static("styles"));

//Gloabl Users data
const users = {
    // "userRandomID": {
    //   id: "userRandomID",
    //   user_name: "Alice",
    //   password: "$2a$10$UZxhRDJEJjqdoA86bB/hl.r0w0DiaoUxL08LFjm5h3UnkjeupsNUS"
    // },
    // "user2RandomID": {
    //   id: "user2RandomID",
    //   email: "a@a.com",
    //   password: "$2a$10$UZxhRDJEJjqdoA86bB/hl.r0w0DiaoUxL08LFjm5h3UnkjeupsNUS"
    // }
  };


// get routes

app.get('/', (req, res) => {
 res.render('index')
});

app.get('/create', (req, res) => {
  res.render('new_site')
 });

//REGISTRATION PAGE
// app.get("/register", (req, res) => {
//  res.render("register")
// });

app.get("/register", (req, res) => {

    const templateVars = {
      users: users[req.session.user_id] };

    if (req.session.user_id) {
      return res.redirect("user_page");
    }

    res.render("register", templateVars);

  });

  // POST code to register
app.post("/register", (req, res) => {

    const { email, password } = req.body;
    const user = getUserByEmail(email);

    console.log('line 65:', user);
    // const id = generateRandomString();
    // const hashedPassword = bcrypt.hashSync(password, 10);

    if (user) {
        res.status(403);
        res.send("An account with this email already exists");
    } else if (!email || !password) {
        res.status(403);
        res.send("Either the email or password are empty");
    } else {

        req.session.user_id = email;
        console.log("line 92:", req.session.user_id)
        res.redirect("/user_page/");

      // INSERT STATEMENT INTO THE USERS TABLE
        return pool
          .query(`INSERT INTO users (email, password)
                  VALUES ($1, $2) RETURNING*`, [`${user.email}`, `${user.password}`])
          .then((result) => {
            console.log(result);
            return result.rows[0];
          })
          .catch((error) => {
            console.log(error.message);
          });


        // users[id] = {"id":id, "email":email, "password": hashedPassword };
    }

  });

app.get("/user_page", (req, res) => {
 res.render("user_page")
});

app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}`);
});

// POST code to logout
app.post("/logout", (req, res) => {
  req.session = null; // delete cookie when logging out
  res.redirect("/");
});


// // load .env data into process.env
// require("dotenv").config();

// // Web server config
// const PORT = process.env.PORT || 8080;
// const sassMiddleware = require("./lib/sass-middleware");
// const express = require("express");
// const app = express();
// const morgan = require("morgan");

// // PG database client/connection setup
// const { Pool } = require("pg");
// const dbParams = require("./lib/db.js");
// const db = new Pool(dbParams);
// db.connect();

// // Load the logger first so all (static) HTTP requests are logged to STDOUT
// // 'dev' = Concise output colored by response status for development use.
// //         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
// app.use(morgan("dev"));

// app.set("view engine", "ejs");
// app.use(express.urlencoded({ extended: true }));

// app.use(
//   "/styles",
//   sassMiddleware({
//     source: __dirname + "/styles",
//     destination: __dirname + "/public/styles",
//     isSass: false, // false => scss, true => sass
//   })
// );

// app.use(express.static("public"));

// // Separated Routes for each Resource
// // Note: Feel free to replace the example routes below with your own
// const usersRoutes = require("./routes/users");
// const widgetsRoutes = require("./routes/widgets");

// // Mount all resource routes
// // Note: Feel free to replace the example routes below with your own
// app.use("/api/users", usersRoutes(db));
// app.use("/api/widgets", widgetsRoutes(db));
// // Note: mount other resources here, using the same pattern above

// // Home page
// // Warning: avoid creating more routes in this file!
// // Separate them into separate routes files (see above).

// app.get("/", (req, res) => {
//   res.render("index");
// });

// app.listen(PORT, () => {
//   console.log(`Example app listening on port ${PORT}`);
// });


