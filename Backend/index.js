const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {
  registerUser,
  verifyCredentials,
  getUserByEmail,
} = require("./Controllers/controller.js");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "az_AZ";

const activityLogger = (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] - Ruta consultada: ${req.method} ${req.originalUrl}`,
  );
  next();
};

app.use(activityLogger);

const validateCredentials = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email y password son obligatorios" });
  }
  next();
};

const verifyToken = (req, res, next) => {
  const authorizationHeader = req.header("Authorization");
  if (!authorizationHeader) {
    return res
      .status(401)
      .json({ error: "Token no proporcionado en las cabeceras" });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json({ error: "Formato de token inválido" });
  }

  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

app.post("/usuarios", validateCredentials, async (req, res) => {
  try {
    const user = req.body;
    await registerUser(user);
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error(error);
    res
      .status(error.code || 500)
      .json({ error: error.message || "Error interno del servidor" });
  }
});

app.post("/login", validateCredentials, async (req, res) => {
  try {
    const { email, password } = req.body;
    await verifyCredentials(email, password);

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res
      .status(error.code || 500)
      .json({ error: error.message || "Error en la autenticación" });
  }
});

app.get("/usuarios", verifyToken, async (req, res) => {
  try {
    const authorizationHeader = req.header("Authorization");
    const token = authorizationHeader.split("Bearer ")[1];

    const { email } = jwt.decode(token);
    const userData = await getUserByEmail(email);

    res.json([userData]);
  } catch (error) {
    console.error(error);
    res
      .status(error.code || 500)
      .json({ error: error.message || "Error al obtener el usuario" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
