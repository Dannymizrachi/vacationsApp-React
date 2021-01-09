// Basically ENUM, declaring an object that contains every variation (type) of error
let ErrorType = {
  UNAUTHORIZED: {
    id: 1,
    httpCode: 401,
    message: "Login failed, invalid email or password",
    isShowStackTrace: false,
  },
  GENERAL_ERROR: {
    id: 2,
    httpCode: 600,
    message: "An error as occurred, please retry",
    isShowStackTrace: true,
  },
  USERSNAME_ALREADY_TAKEN: {
    id: 3,
    httpCode: 601,
    message: "Username is already taken",
    isShowStackTrace: false,
  },

  DATE_UNAVAILABLE: {
    id: 4,
    httpCode: 605,
    message: "The picked date is unavailable",
    isShowStackTrace: false,
  },
  FAILED_TO_GET_VACATIONS:{
  id: 5,
  httpCode:606,
  message: "failed to get vacations",
  isShowStackTrace:true,
}
};

// Exporting ErrorType to external files...
module.exports = ErrorType;
