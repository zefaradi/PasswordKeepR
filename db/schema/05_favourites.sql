DROP TABLE IF EXISTS favourites CASCADE;

CREATE TABLE favourites (
  id SERIAL PRIMARY KEY NOT NULL,
  companyPassword_id INTEGER REFERENCES company_passwords(id) ON DELETE CASCADE
);


