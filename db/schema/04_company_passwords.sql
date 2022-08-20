DROP TABLE IF EXISTS company_passwords CASCADE;

CREATE TABLE company_passwords (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  company_password VARCHAR(255) NOT NULL
);
