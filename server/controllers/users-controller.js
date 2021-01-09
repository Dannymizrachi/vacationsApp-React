const usersLogic = require("../logic/users-logic");
const express = require("express");
const router = express.Router();

//register
router.post("/register", async (request, response, next) => {
  try {
    let userDetails = request.body;
    let userName = userDetails.userName;
    let firstName = userDetails.firstName;
    let lastName = userDetails.lastName;
    let password = userDetails.password;

    await usersLogic.addUser(userName, firstName, lastName, password);
    response.json();
  } catch (error) {
    return next(error);
  }
});

//login
router.post("/login", async (request, response, next) => {
  try {
    let userDetails = request.body;

    let userName = userDetails.userName;
    let userPassword = userDetails.password;

    let successfullLoginData = await usersLogic.login(userName, userPassword);
    response.json(successfullLoginData);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
