var express = require("express");
var router = express.Router();
const DButils = require("../../modules/DButils");
const bcrypt = require("bcrypt");
const users_logic = require("./users_logic");

router.post("/Register", async (req, res, next) => {
  let user = req.body;
  let hash_password = bcrypt.hashSync(
    req.body.password,
    parseInt(process.env.bcrypt_saltRounds)
  );
  user.password = hash_password;
  const exists = await users_logic.DBcontains(user.username);
  if (exists) {
    res
      .status(400)
      .send({ message: "Invalid username supplied", success: false });
  } else {
    try {
      const ans = await users_logic.createNewUser(user);
      res.status(201).send({ message: "Successful register", success: true });
    } catch (error) {
      next(error);
    }
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    // check that username exists
    const user = await users_logic.DBreturnUser(req.body.username);
    if (user == null)
      res
        .status(401)
        .send({ message: "Username or Password incorrect", success: false });
    if (!bcrypt.compareSync(req.body.password, user[0].password)) {
      res
        .status(401)
        .send({ message: "Username or Password incorrect", success: false });
    }
    // Set cookie
    req.session.user_id = user[0].user_id;

    // return cookie
    res.status(200).send({ message: "Successful log in", success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
