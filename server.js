const express = require("express");
require('dotenv').config()
const bodyParser = require("body-parser");

const { authFactory, AuthError, authUser } = require("./src/auth");
const { create, get } = require('./src/controller')

const PORT = process.env.APP_PORT || 3000;
const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET env var. Set it and restart the server");
}

const auth = authFactory(JWT_SECRET);
const app = express();

app.use(bodyParser.json());

app.post("/auth", (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: "invalid payload" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "invalid payload" });
  }

  try {
    const token = auth(username, password);

    return res.status(200).json({ token });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({ error: error.message });
    }

    next(error);
  }
});

app.post('/movies', authUser, async (req, res, next) => {
  try {
    await create(req, res);
  } catch (err) {
    next(err);
  }
})

app.get('/movies', authUser, async (req, res, next) => {
  try {
    await get(req, res);
  } catch (err) {
    next(err);
  }
})

app.use((error, _, res, __) => {
  console.error(
    `Error processing request ${error}. See next message for details`
  );
  console.error(error);

  return res.status(500).json({ error: "internal server error" });
});

app.listen(PORT, () => {
  console.log(`auth svc running at port ${PORT}`);
});
