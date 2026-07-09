const jwt = require("jsonwebtoken");

const generateToken = (payload, secret) => {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

module.exports = { generateToken };