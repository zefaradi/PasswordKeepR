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
      companyId = company.id
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

module.exports = { getUserByEmail, checkForCompany, hidePassword };


