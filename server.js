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
const { getUserByEmail, checkForCompany, hidePassword, containsSpecialChars } = require('./helpers');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
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

// HOME PAGE

app.get('/', (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    users: users[req.session.user_id]
  };
  // console.log("templatevars", templateVars)
  res.render('index', templateVars)
});

//--------------------------------------------------------------------------------
// code to edit favourited company from the user page

app.get('/edit/:id', (req, res) => {
  const user_id = req.session.user_id
  if (!user_id) {
    res.status(404);
    res.send("Please login to use the application.");
  } else {
    pool
      .query(`SELECT companies.id AS company_id, companies.name, company_passwords.company_username AS user_name, company_passwords.company_password AS user_password
  FROM companies
  JOIN company_passwords ON company_id = companies.id
  WHERE companies.id = $1`, [req.params.id])
      .then((result) => {
        getUserById(user_id).then((user) => {
          const templateVars = {
            userID: user_id,
            user: user,
            ...result.rows[0]
          }

          // const templateVars = {...result.rows[0]};
          templateVars.hash_password = hidePassword(result.rows[0].user_password)
          res.render('edit_site', templateVars);
        })
      })
  }
});
// code to delete the favourited company from the user page

app.post('/social/:id/delete', (req, res) => {
  pool
    .query(`DELETE FROM company_passwords
          WHERE company_id = $1`, [req.params.id])
          // console.log('line 78', req.params.id)
    .then((result) => {
      // const templateVars = {
      //   favourites: result.rows
      // }
      // console.log("line 66:", templateVars);
      res.redirect('/social');
    })
});

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
  // console.log("line 58:", req.body);
  pool
    .query(`UPDATE company_passwords SET company_username = $1
  WHERE company_id = $2 RETURNING*`, [req.body.email, req.params.id])
    .then((result) => {
      if (!req.body.email) {
        return res.status(403).send('username cannot be blank.');
      } else {
        // console.log("line 63:", result.rows);
        res.redirect(`/edit/${req.params.id}`);
      }
    })

})

// code to edit the password for a favourited company

app.post('/edit/:id/password', (req, res) => {
  // console.log("line 58:", req.body);
  pool
    .query(`UPDATE company_passwords SET company_password = $1
    WHERE company_id = $2 RETURNING*`, [req.body.password, req.params.id])
    .then((result) => {
      if (!req.body.password) {
        return res.status(403).send("Password cannot be blank.");
      } else {
        // console.log("line 63:", result.rows);
        res.redirect(`/edit/${req.params.id}`);
      }
    })
})

// GET ROUTES FOR CATEGORIES---------- //

app.get('/work', (req, res) => {
  const user_id = req.session.user_id
  if (!req.session.user_id) {
    res.status(404);
    res.send("Please login to access this page");
  } else {
    return pool
      .query(`SELECT * FROM companies
            WHERE category_id = $1 LIMIT 10`, [2])
      .then((result) => {
        getUserById(user_id).then((user) => {
          const templateVars = {
            userID: user_id,
            user: user,
            favourites: result.rows
          }
          // const templateVars = {
          //   favourites: result.rows
          // }
          // console.log("line 209:", templateVars);
          res.render('work_sites', templateVars)
        })
      })
  }
})

app.get('/entertainment', (req, res) => {
  const user_id = req.session.user_id
  if (!req.session.user_id) {
    res.status(404);
    res.send("Please login to access this page");
  } else {
    return pool
      .query(`SELECT * FROM companies
            WHERE category_id = $1 LIMIT 10`, [1])
      .then((result) => {
        getUserById(user_id).then((user) => {
          const templateVars = {
            userID: user_id,
            user: user,
            favourites: result.rows
          }
          // const templateVars = {
          //   favourites: result.rows
          // }
          // console.log("line 146:", templateVars);
          res.render('entertainment_sites', templateVars)
        })
      })
  }
})

app.get('/social', (req, res) => {
  const user_id = req.session.user_id
  if (!req.session.user_id) {
    res.status(404);
    res.send("Please login to access this page");
  } else {
    return pool
      .query(`SELECT * FROM companies
            WHERE category_id = $1 LIMIT 10`, [3])
      .then((result) => {
        getUserById(user_id).then((user) => {
          const templateVars = {
            userID: user_id,
            user: user,
            favourites: result.rows
          }
          // const templateVars = {
          //   favourites: result.rows
          // }
          // console.log("line 209:", templateVars);
          res.render('social_sites', templateVars)
        })
      })
  }
})

//----------------------------------------------------------------

//LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    users: users[req.session.user_id]
  };

  if (req.session.user_id) {
    res.redirect("/user_page");
  } else {
    // res.send("Please log in with valid credentials");
    res.render('login', templateVars);
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
  const user_id = req.session.user_id
  const templateVars = {
    users: users[req.session.user_id]
  };

  if (req.session.user_id) {
    return res.redirect("user_page");
  } else {
    getUserById(user_id).then((user) => {
      const templateVars = {
        userID: user_id,
        user: user
      }
      res.render("register", templateVars);
    })

  }

});

// POST code to register
app.post("/register", (req, res) => {

  const { email, password } = req.body;
  getUserByEmail(email)
    .then((result) => {
      const user = result[0];

      //

      if (user) {
        res.status(403);
        return res.send("An account with this email already exists");
      } else if (!email || !password) {
        res.status(403);
        return res.send("Either the email or password are empty");
      } else if (req.body.password.length < 8 || !containsSpecialChars(req.body.password)) {
          return res.send('please enter a password of 8 or more characters and include a special character')
      } else {
        // INSERT STATEMENT INTO THE USERS TABLE
        return pool
          .query(`INSERT INTO users (email, password)
                  VALUES ($1, $2) returning *`, [`${email}`, `${password}`])
      }
    })
    .then((result) => {
      // console.log(result);
      req.session.user_id = result.rows[0].id
      return pool
        .query(`INSERT INTO company_passwords (user_id, company_username, company_id, company_password)
                  VALUES ($1, 'example@example.com', $2, 'Password'),  ($1, 'example@example.com', $3, 'Password'),
                  ($1, 'example@example.com', $4, 'Password')
                  RETURNING *`, [result.rows[0].id, 1, 2, 3])
        .then((favourite) => {
          // console.log("line 182:", favourite.rows)
          req.session.user_id = result.rows[0].id
          pool.query(`INSERT INTO favourites (companyPassword_id) VALUES ($1), ($2), ($3)`, [favourite.rows[0].id, favourite.rows[1].id, favourite.rows[2].id])
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

const getCompanyPasswordForUser = (user_id) => {
  return pool
    .query(`SELECT companies.id, company_password, companies.name AS name FROM company_passwords
        JOIN companies
        ON companies.id = company_id
        WHERE user_id = $1`, [user_id])
    .then((result) => result.rows)
}

const getUserById = (user_id) => {
  return pool
    .query(`SELECT users.email FROM users WHERE id = $1`, [user_id])
    .then((result) => result.rows[0])
}

app.get("/user_page", (req, res) => {
  const user_id = req.session.user_id
  // check for a cookie
  if (!user_id) {
    res.status(404);
    res.send("Please login to use the application.");
  } else {
    return getCompanyPasswordForUser(user_id).then((company_passwords) => {
      getUserById(user_id).then((user) => {
        const templateVars = {
          favourites: company_passwords,
          userID: user_id,
          user: user
        }
        // console.log('line 348', templateVars)
        res.render("user_page", templateVars)
      })
    })
  }
  //  res.render("user_page")
});

//-------------------------------------------------
// ADD A NEW WEBSITE

// code to take you the create a new website on the user page
app.get('/create', (req, res) => {
  const user_id = req.session.user_id
  if (!req.session.user_id) {
    res.status(404);
    res.send("Please login to use the application.");
  } else {
    getUserById(user_id).then((user) => {
      const templateVars = {
        userID: user_id,
        user: user,
        website: req.query.website ? req.query.website : null
      }
      res.render('new_site', templateVars);
    })
  }
});

// code to add a new website to the user page

app.post("/create", (req, res) => {
  // check for a cookie
  if (!req.session.user_id) {
    res.status(404);
    res.send("Please login to use the application.");
  } else {
    // console.log("line 179:", req.session.user_id);
    const user_id = req.session.user_id;
    checkForCompany(req.body.website, req.body.categoryList)
      .then((result) => {
        // console.log("line 279", result);
        const company_id = result;
        pool
          .query(`SELECT * FROM company_passwords WHERE company_passwords.user_id = $1 AND company_passwords.company_id = $2`, [user_id, company_id])
          .then((result) => {
            // console.log("line 192:", result.rows);
            if (!result.rows.length) {
              pool
                .query(`INSERT INTO company_passwords (user_id, company_username, company_id, company_password)
                VALUES ($1, $2, $3, $4) RETURNING*`, [user_id, req.body.username, company_id, req.body.password])
                .then((result) => {
                  // console.log("line 199:",result.rows);
                  const companyPassId = result.rows[0].id
                  pool
                    .query(`SELECT * FROM favourites WHERE companyPassword_id = $1`, [companyPassId])
                    .then((result) => {
                      if (!result.rows.length) {
                        pool
                          .query(`INSERT INTO favourites (companyPassword_id)
                      VALUES ($1)`, [companyPassId])
                          .then(() => {
                            res.redirect("/user_page");
                          })
                      }
                    })
                })
            } else {
              res.send("This website is already added to your favourited page. Please click <a href='http://localhost:3000/user_page'> here. </a>")
            }
          })
      })
  }
})


//-----------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// POST code to logout
app.post("/logout", (req, res) => {
  req.session = null; // delete cookie when logging out
  res.redirect("/");
});
