const jwt = require("jsonwebtoken");

const users = [
  {
    id: 123,
    role: "basic",
    name: "Basic Thomas",
    username: "basic-thomas",
    password: "sR-_pcoow-27-6PAwCD8",
  },
  {
    id: 434,
    role: "premium",
    name: "Premium Jim",
    username: "premium-jim",
    password: "GBLtTyq3E_UNjFnpo9m6",
  },
];

class AuthError extends Error {}

const authFactory = (secret) => (username, password) => {
  const user = users.find((u) => u.username === username);

  if (!user || user.password !== password) {
    throw new AuthError("invalid username or password");
  }

  return jwt.sign(
    {
      userId: user.id,
      name: user.name,
      role: user.role,
    },
    secret,
    {
      issuer: "https://www.netguru.com/",
      subject: `${user.id}`,
      expiresIn: 30 * 60,
    }
  );
};

function authUser(req, res, next){
    var token = req.header('Authorization')
    if(!token || !token.includes('Bearer')) return res.status(401).send('Unautherized user');
    token = token.replace("Bearer ","");
    try {
        const isVerified = jwt.verify(token, process.env.JWT_SECRET)
        req.user = isVerified
        next();
    } catch (error) {
        res.status(400).send('Invalid token')
    }

}

module.exports = {
  authFactory,
  AuthError,
  authUser
};
