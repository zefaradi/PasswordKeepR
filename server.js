const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  host: 'localhost',
  database: 'midterm'
});

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
// app.use("/styles", express.static("styles"));
app.use(express.static("public"));

//TO KEEP TRACK OF THE COOKIES
const users = {};

// get routes

app.get('/', (req, res) => {
 res.render('index')
});

//--------------------------------------------------------------------------------
// code to edit favourited company from the user page

app.get('/edit/:id', (req, res) => {
  pool
  .query(`SELECT companies.id AS company_id, companies.name, company_passwords.company_username AS user_name, company_passwords.company_password AS user_password
  FROM companies
  JOIN company_passwords ON company_id = companies.id
  WHERE companies.id = $1`, [req.params.id])
  .then((result) => {
    const templateVars = result.rows[0];
    console.log("line 49:", templateVars);
    console.log("line 50:", req.params.id);
    res.render('edit_site', templateVars);
  })
 });

 //-------------------------------------------------------------------------------
// code to delete the favourited company from the user page

app.post('/edit/:id/delete', (req, res) => {
  pool
  .query(`DELETE FROM company_passwords
          WHERE company_id = $1`, [req.params.id])
  .then((result) => {
    // const templateVars = {
    //   favourites: result.rows
    // }
    // console.log("line 66:", templateVars);
    res.redirect('/user_page');
  })
 });

//--------------------------------------------------------------------------------
// code to edit the user name for a favourited company

 app.post('/edit/:id/username', (req, res) => {
  console.log("line 58:", req.body);
  pool
  .query(`UPDATE company_passwords SET company_username = $1
  WHERE company_id = $2 RETURNING*`, [req.body.email, req.params.id])
  .then((result) => {
      console.log("line 63:", result.rows);
      res.redirect(`/edit/${req.params.id}`);
    })

  })

//-------------------------------------------------------------------------------

app.get('/login', (req, res) => {
  res.render('login')
 });

app.get('/create', (req, res) => {
  res.render('new_site')
 });

 //----------------------------------------------------------------

 //LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    users: users[req.session.user_id] };

  if (req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("/", templateVars);
  }

});

//POST code for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  getUserByEmail(email)
  .then((result) => {
    const user = result[0];

      if (!email || !password) {
        return res.status(403).send('Email or Password cannot be blank.');
      } else if (user && password === user.password) {
        req.session.user_id = user.id;
        res.redirect("/user_page");
      } else if (!user) {
        res.status(403);
        res.send("There is no account with this email.");
      } else {
        res.status(403);
        res.send("Invalid login credentials.");
    }

  })

});

//-------------------------------------------------------------------

//REGISTRATION PAGE

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
    getUserByEmail(email)
    .then((result) => {
      const user = result[0];

      if (user) {
        res.status(403);
        res.send("An account with this email already exists");
      } else if (!email || !password) {
        res.status(403);
        res.send("Either the email or password are empty");
      } else {
      // INSERT STATEMENT INTO THE USERS TABLE
        return pool
          .query(`INSERT INTO users (email, password)
                  VALUES ($1, $2) RETURNING*`, [`${email}`, `${password}`])
    }
    })
    .then((result) => {
      // console.log(result);
      req.session.user_id = result.rows[0].id
      return pool
          .query(`INSERT INTO company_passwords (user_id, company_username, company_id, company_password)
                  VALUES ($1, "example@example.com", $2, "Password"),  ($1, "example@example.com", $3, "Password"),
                  ($1, "example@example.com", $4, "Password"),
                  RETURNING*`, [result.rows[0].id, 1, 2, 3 ] )
                  .then((favourite) => {
                    console.log("line 182:",favourite)
                  // req.session.user_id = result.rows[0].id
                  // pool.
                  // query(`INSERT INTO favourites `)
                  res.redirect("/user_page");
                  })
    })
    .catch((error) => {
      console.log(error.message);
    });

  });

  //-------------------------------------------------
  // USER PAGE

app.get("/user_page", (req, res) => {
  // check for a cookie
  if (!req.session.user_id) {
    res.status(404);
    res.send("Please login to access the URLs");
  } else {
    return pool
    .query(`SELECT companies.id, companies.name AS name FROM company_passwords
            JOIN companies
            ON companies.id = company_id
            WHERE user_id = $1`, [req.session.user_id])
    .then((result) => {
      const templateVars = {
        favourites: result.rows
      }
      console.log("line 209:", templateVars);
      res.render("user_page", templateVars)
    })
  }
//  res.render("user_page")
});

  //-------------------------------------------------
  // ADD A NEW WEBSITE

  app.post("/create", (req, res) => {
    // check for a cookie
    if (!req.session.user_id) {
      res.status(404);
      res.send("Please login to access the URLs");
    } else {
      // console.log("line 179:", req.session.user_id);
      const user_id = req.session.user_id;
      pool.
      query(`SELECT * FROM companies where companies.name = $1`, [req.body.website])
      .then((result) => {
        if(result.rows.length > 0) {
          res.send("This website is already added to your favourited page. Please click <a href = 'http://localhost:3000/user_page'> here.</a>");
        }
        else if (!result.rows.length) {
          pool
          .query(`INSERT INTO companies (name, category_id)
          VALUES ($1, $2) RETURNING*`, [req.body.website, req.body.categoryList])
          .then((result) => {
            // console.log(result.rows);
            const company_id = result.rows[0].id;
            pool
            .query(`SELECT * FROM company_passwords WHERE company_passwords.user_id = $1 AND company_passwords.company_id = $2`,[user_id, company_id])
            .then((result) => {
              // console.log("line 192:", result.rows);
              if(!result.rows.length) {
                pool
                .query(`INSERT INTO company_passwords (user_id, company_username, company_id, company_password)
                VALUES ($1, $2, $3, $4) RETURNING*`, [user_id, req.body.username, company_id, req.body.password])
                .then((result) => {
                  // console.log("line 199:",result.rows);
                  pool
                  .query(`SELECT * FROM favourites WHERE user_id = $1 AND company_id = $2`, [user_id, company_id])
                  .then((result) => {
                    if(!result.rows.length) {
                      pool
                      .query(`INSERT INTO favourites (user_id, company_id)
                      VALUES ($1, $2)`, [user_id, company_id])
                      .then(() => {
                        res.redirect("/user_page");
                      })
                    }
                  })
                })
              }
            })
          })
        }
        // console.log(result.rows);
      })
      // return pool
      // .query(`INSERT INTO companies (name, category_id)
      // VALUES ($1, $2) RETURNING*`, [req.body.website, req.body.categoryList])
      // .then((result) => {
      //   // const templateVars = {
      //   //   favourites: result.rows
      //   // }
      //   // console.log(templateVars);
      //   console.log("line 187:", req.body);
      //   res.render("new_site");
      // })
    }
  //  res.render("new_site");
  });

  //-----------------------------------------

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


