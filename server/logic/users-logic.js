const usersDao = require("../dao/users-dao");
const ErrorType = require("../errors/error-type");
const ServerError = require("./../errors/server-error");
const cacheModule = require("../dao/cache-module");
const jwt = require("jsonwebtoken");
const config = require("../config.json");
const RIGHT_SALT = "ksdjfhbAWEDCAS29!@$addlkmn";
const LEFT_SALT = "32577098ASFKJkjsdhfk#$dc";

//add a user
async function addUser(userName, firstName, lastName, password) {
  if (await usersDao.isUserAlreadyExistsByUsername(userName)) {
    throw new ServerError(ErrorType.USERSNAME_ALREADY_TAKEN);
  }

  await usersDao.addUser(userName, firstName, lastName, password);
}

//login
async function login(userName, password) {
  let userData = await usersDao.login(userName, password);
  let saltedUserName = LEFT_SALT + userName + RIGHT_SALT;

  const jwtToken = jwt.sign(
    { sub: saltedUserName, userType: userData.user_type },
    config.secret
  );

  cacheModule.set(jwtToken, userData);

  let successfullLoginResponse = {
    token: jwtToken,
    userType: userData.user_type,
  };
  console.log(successfullLoginResponse);
  return successfullLoginResponse;
}

module.exports = {
  addUser,
  login,
};
