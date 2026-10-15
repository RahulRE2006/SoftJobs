const pool = require("../db");
const bcrypt = require("bcryptjs");

const registerUser = async ({ email, password, rol, lenguage }) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const query =
    "INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4) RETURNING *";
  const values = [email, hashedPassword, rol, lenguage];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const verifyCredentials = async (email, password) => {
  const query = "SELECT * FROM usuarios WHERE email = $1";
  const { rows, rowCount } = await pool.query(query, [email]);

  if (!rowCount) {
    throw { code: 404, message: "Usuario no encontrado" };
  }

  const user = rows[0];
  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    throw { code: 401, message: "Credenciales inválidas" };
  }
};

const getUserByEmail = async (email) => {
  const query = "SELECT email, rol, lenguage FROM usuarios WHERE email = $1";
  const { rows, rowCount } = await pool.query(query, [email]);

  if (!rowCount) {
    throw { code: 404, message: "Usuario no encontrado" };
  }

  return rows[0];
};

module.exports = { registerUser, verifyCredentials, getUserByEmail };
