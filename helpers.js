const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  host: 'localhost',
  database: 'midterm'
});

//Checks if an E-mail already exists in the user database
const getUserByEmail = (email) => {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      // console.log("line 16:",result.rows[0])
      return result.rows;
    })

    .catch((err) => console.log(err.message));
};

const checkForCompany = async (companyName, categoryList) => {
  let companyId;
  try {
    const result = await pool.query(`SELECT * FROM companies where companies.name = $1`, [companyName])
    if (result.rows.length === 0) {
      const company = await pool
        .query(`INSERT INTO companies (name, category_id)
        VALUES ($1, $2) RETURNING*`, [companyName, categoryList])
        console.log("company", company);
      companyId = company.rows[0].id
    } else {
      companyId = result.rows[0].id
    }
    return companyId
  } catch {
    (error) => {
      console.log(error.message)
    }
  }
}

// Hide password on edit page
const hidePassword = (password) => {
  const hidden = [];
  for (const letter of password) {
    hidden.push('*')
  }
   return hidden.join('');
}

// USER PASSWORD MUST BE 8 CHARACTERS AND USE SPECIAL CHARACTER
function containsSpecialChars(str) {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
}

// Get Company Password For User
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

module.exports = { getUserByEmail, checkForCompany, hidePassword, containsSpecialChars, getCompanyPasswordForUser, getUserById };


