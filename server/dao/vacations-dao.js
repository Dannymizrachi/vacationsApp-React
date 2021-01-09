const connection = require("./connection-wrapper");
const ErrorType = require("../errors/error-type");
let ServerError = require("../errors/server-error");

//get all vacations
async function getAllVacations(userId) {
  let sql = `
  SELECT
  vacations.id as vacationId,
    DATE_FORMAT(start_date, '%Y-%m-%d') as 'start_date',
    DATE_FORMAT(end_date, '%Y-%m-%d') as 'end_date',
    price,
    description,
    vacations.destination,
    img_src as imgSrcString,
    followed_vacations.vacation_id as isFollowed
FROM 
  vacations 
left join
  followed_vacations 
on 
  followed_vacations.user_id = ? and followed_vacations.vacation_id = vacations.id
WHERE
  start_date > CURRENT_DATE()`;

  let parameters = [userId];

  try {
    let vacations_data;
    vacations_data = await connection.executeWithParameters(sql, parameters);
    return vacations_data;
  } catch (error) {
    throw new ServerError(ErrorType.FAILED_TO_GET_VACATIONS, sql, error);
  }
}

//add new vacation
async function addNewVacation(
  startDate,
  endDate,
  price,
  description,
  imgSrc,
  destination
) {
  let sql =
    "INSERT INTO vacations (start_date, end_date, price, description, img_src, destination) VALUES(?, ?, ?, ?, ?,?)";
  let parameters = [
    startDate,
    endDate,
    price,
    description,
    imgSrc,
    destination,
  ];

  try {
    await connection.executeWithParameters(sql, parameters);
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, parameters, error);
  }
}

//delete a vacation
async function deleteVacation(vacationId) {
  let sql = `DELETE  FROM vacations
  where id = ?`;
  let parameters = [vacationId];
  try {
    await connection.executeWithParameters(sql, parameters);
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, parameters, error);
  }
}

//edit a vacation
async function editVacation(
  startDate,
  endDate,
  price,
  description,
  imgSrc,
  vacationId,
  destination
) {
  let sql = `UPDATE vacations
  set
  start_date =?,
    end_date =?,
    price=?,
    description =?,
    img_src =?,
    destination=?
  where id =? `;
  let parameters = [
    startDate,
    endDate,
    price,
    description,
    imgSrc,
    destination,
    vacationId,
  ];

  try {
    await connection.executeWithParameters(sql, parameters);
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, parameters, error);
  }
}

//follow a vacation
async function followVacation(vacationId, userId) {
  let sql =
    "insert into followed_vacations set user_id=? , destination=(select destination from vacations where id =?), vacation_id=?";
  let parameters = [userId, vacationId, vacationId];

  try {
    await connection.executeWithParameters(sql, parameters);
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, parameters, error);
  }
}

//get followed vacations
async function getFollowedVacations() {
  let sql = `select 
  followed_vacations.vacation_id,
count(followed_vacations.vacation_id) as "number_of_followers"
from
followed_vacations
group by 
vacation_id`;
  try {
    let followedVacations = await connection.execute(sql);
    return followedVacations;
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, error);
  }
}

//filter vacations by user search
async function onSearchVacation(statDate, endDate, destination) {
  let sql = `select DATE_FORMAT(start_date, '%Y-%m-%d') as 'start_date',
  DATE_FORMAT(end_date, '%Y-%m-%d') as 'end_date',
   description,
  price,
  img_src as imgSrcString,
  destination,
  id as vacationId
   FROM vacations.vacations
  where start_date >= ?
   and end_date <= ?
    and destination Like concat('%', ? ,'%')`;
  let parameters = [statDate, endDate, destination];
  let filterdVacations = await connection.executeWithParameters(
    sql,
    parameters
  );
  return filterdVacations;
}

//unfollow a vacation
async function unfollowVacation(vacationId, userId) {
  let sql = `delete from followed_vacations where vacation_id =? and user_id=?`;
  let parameters = [vacationId, userId];
  try {
    await connection.executeWithParameters(sql, parameters);
  } catch (error) {
    throw new ServerError(ErrorType.GENERAL_ERROR, error);
  }
}

module.exports = {
  getAllVacations,
  addNewVacation,
  deleteVacation,
  editVacation,
  followVacation,
  getFollowedVacations,
  onSearchVacation,
  unfollowVacation,
};
