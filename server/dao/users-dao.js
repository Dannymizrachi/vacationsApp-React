const connection = require("./connection-wrapper");
const ErrorType = require("../errors/error-type");
let ServerError = require("./../errors/server-error");

//add user
async function addUser(userName, firstName, lastName, password) {
  let userType = "CUSTOMER";
  let sql =
    "INSERT INTO users (user_name, password, user_type ,first_name, last_name) values(?, ?, ?, ?, ?)";
  let parameters = [userName, password, userType, firstName, lastName];

  try {
    await connection.executeWithParameters(sql, parameters);
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, parameters, error);
  }
}

//login
async function login(userName, password) {
  let sql =
    "SELECT user_type, id FROM users WHERE user_name = ? and password = ?";
  let parameters = [userName, password];

  try {
    let userLoginResult;
    userLoginResult = await connection.executeWithParameters(sql, parameters);

    if (userLoginResult == null || userLoginResult.length == 0) {
      return userLoginResult;
    } else {
      return userLoginResult[0];
    }
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, parameters, error);
  }
}

//check if user name exists
async function isUserAlreadyExistsByUsername(userName) {
  let sql = "SELECT id FROM users WHERE user_name = ?";
  let parameters = [userName];

  try {
    let isUsernameFoundData;
    isUsernameFoundData = await connection.executeWithParameters(
      sql,
      parameters
    );

    if (isUsernameFoundData == null || isUsernameFoundData.length == 0) {
      return false;
    }

    return true;
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, parameters, error);
  }
}

module.exports = {
  addUser,
  login,
  isUserAlreadyExistsByUsername,
};
