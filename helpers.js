const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  host: 'localhost',
  database: 'midterm'
});

//Checks if an E-mail already exists in the user database
const getUserByEmail  = (email) => {
    return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then ((result) => {
        // console.log("line 16:",result.rows[0])
        return result.rows;
    })

    .catch((err) => console.log(err.message));

    // for (let user in database) {
    //   if (database[user].email === email) {
    //     return database[user];
    //   }
    // }
    // return undefined;
  };

  exports.getUserByEmail = getUserByEmail;

  // const test = getUserByUser_name("Alice");

