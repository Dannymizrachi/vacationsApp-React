const express = require("express");
const router = express.Router();
const vacationsLogic = require("../logic/vacations-logic");

//get all vacations
router.get("/", async (request, response, next) => {
  try {
    let authorizationString = request.headers["authorization"];
    let token = authorizationString.substring("Bearer ".length);

    let vacations_data = await vacationsLogic.getAllVacations(token);
    response.json(vacations_data);
  } catch (error) {
    return next(error);
  }
});

//add a vacation
router.post("/add-vacation", async (request, response, next) => {
  try {
    let vacationDetails = request.body;
    let startDate = vacationDetails.startDate;
    let endDate = vacationDetails.endDate;
    let price = vacationDetails.price;
    let description = vacationDetails.description;
    let imgSrc = vacationDetails.imgSrc;
    let destination = vacationDetails.destination;

    await vacationsLogic.addNewVacation(
      startDate,
      endDate,
      price,
      description,
      imgSrc,
      destination
    );
    response.json();
  } catch (error) {
    return next(error);
  }
});

//delete a vacation
router.post("/delete-vacation", async (request, response, next) => {
  try {
    let vacationId = request.body;

    await vacationsLogic.deleteVacation(vacationId.vacationId);
    response.json();
  } catch (error) {
    return next(error);
  }
});

//edit a vacation
router.post("/edit-vacation", async (request, response, next) => {
  let vacationDetails = request.body;
  console.log(vacationDetails);
  let startDate = vacationDetails.start_date;
  let endDate = vacationDetails.end_date;
  let price = vacationDetails.price;
  let description = vacationDetails.description;
  let imgSrc = vacationDetails.imgSrcString;
  let vacationId = vacationDetails.vacationId;
  let destination = vacationDetails.destination;

  try {
    await vacationsLogic.editVacation(
      startDate,
      endDate,
      price,
      description,
      imgSrc,
      vacationId,
      destination
    );
    response.json();
  } catch (err) {
    // return next(error);
    console.error(err);
    response.status(600).send(error.message);
  }
});

//follow a vacation
router.post("/follow-vacation", async (request, response, next) => {
  try {
    let authorizationString = request.headers["authorization"];
    let token = authorizationString.substring("Bearer ".length);

    let vacationDetails = request.body;

    console.log(vacationDetails);
    let vacationId = vacationDetails.vacationId;

    await vacationsLogic.followVacation(vacationId, token);
    response.json();
  } catch (error) {
    return next(error);
  }
});

//get followed vacations
router.get("/get-followed-vacations", async (request, response, next) => {
  try {
    let followedVacations = await vacationsLogic.getFollowedVacations();
    response.json(followedVacations);
  } catch (error) {
    return next(error);
  }
});

//unfollow a vacation
router.post("/unfollow-vacation", async (request, response, next) => {
  let authorizationString = request.headers["authorization"];
  let token = authorizationString.substring("Bearer ".length);

  let vacationDetails = request.body;
  let vacationId = vacationDetails.vacationId;

  try {
    await vacationsLogic.unfollowVacation(vacationId, token);
    response.json();
  } catch (error) {
    return next(error);
  }
});

//filter vacation by user search
router.post("/search-vacation", async (request, response, next) => {
  let vacationDetails = request.body;
  let startDate = vacationDetails.start_date;
  let endDate = vacationDetails.end_date;
  let destination = vacationDetails.destination;

  try {
    let filterdVacations = await vacationsLogic.onSearchVacation(
      startDate,
      endDate,
      destination
    );
    response.json(filterdVacations);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
