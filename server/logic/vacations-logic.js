const vacationsDao = require("../dao/vacations-dao");
const ServerError = require("../errors/server-error");
const ErrorType = require("../errors/error-type");
const cacheModule = require("../dao/cache-module");

//get all vacations
async function getAllVacations(token) {
  let userData = cacheModule.get(token);
  let userId = userData.id;
  let vacations_data = await vacationsDao.getAllVacations(userId);

  if (vacations_data.isFollowed != null) {
    vacations_data.isFollowed == true;
    return vacations_data;
  } else {
    vacations_data.isFollowed == false;
    return vacations_data;
  }
}

//add a vacation
async function addNewVacation(vacationDetails) {
  console.log(vacationDetails);
  let startDate = vacationDetails.startDate;
  let endDate = vacationDetails.endDate;
  let price = vacationDetails.price;
  let description = vacationDetails.description;
  let img_src = vacationDetails.imgSrcString;
  let destination = vacationDetails.destination;

  if (await areDatesValid(startDate, endDate)) {
    await vacationsDao.addNewVacation(
      startDate,
      endDate,
      price,
      description,
      img_src,
      destination
    );
  } else {
    throw new ServerError(ErrorType.DATE_UNAVAILABLE);
  }
}

//dates validation
async function areDatesValid(startDate, endDate) {
  let vacationStartDate = new Date(startDate);
  let vacationEndDate = new Date(endDate);

  if (vacationStartDate < vacationEndDate) {
    return true;
  } else {
    return false;
  }
}

//delete a vacation
async function deleteVacation(vacationId) {
  await vacationsDao.deleteVacation(vacationId);
}

//edit a vacation
async function editVacation(vacationDetails) {
  let startDate = vacationDetails.start_date;
  let endDate = vacationDetails.end_date;
  let price = vacationDetails.price;
  let description = vacationDetails.description;
  let imgSrc = vacationDetails.imgSrcString;
  let vacationId = vacationDetails.vacationId;
  let destination = vacationDetails.destination;
  await vacationsDao.editVacation(
    startDate,
    endDate,
    price,
    description,
    imgSrc,
    vacationId,
    destination
  );
}

//follow a vacation
async function followVacation(vacationId, usersToken) {
  let userDetails = cacheModule.get(usersToken);
  let userId = userDetails.id;
  console.log(userId);

  await vacationsDao.followVacation(vacationId, userId);
}

//get followed vacations
async function getFollowedVacations() {
  let followedVacations = await vacationsDao.getFollowedVacations();
  return followedVacations;
}

//unfollow a vacation
async function unfollowVacation(vacationId, usersToken) {
  let userDetails = cacheModule.get(usersToken);
  let userId = userDetails.id;
  await vacationsDao.unfollowVacation(vacationId, userId);
}

//filter vacations by user search
async function onSearchVacation(startDate, endDate, destination) {
  if (await areDatesValid(startDate, endDate)) {
    let filterdVacations = await vacationsDao.onSearchVacation(
      startDate,
      endDate,
      destination
    );
    return filterdVacations;
  } else {
    throw new ServerError(ErrorType.DATE_UNAVAILABLE);
  }
}

module.exports = {
  getAllVacations,
  addNewVacation,
  deleteVacation,
  editVacation,
  followVacation,
  getFollowedVacations,
  unfollowVacation,
  onSearchVacation,
};
