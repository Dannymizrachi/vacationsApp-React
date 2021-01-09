const fs = require("fs");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const usersController = require("./controllers/users-controller");
const vacationsController = require("./controllers/vacations-controller");
const vacationsLogic = require("./logic/vacations-logic");
const fileUpload = require("express-fileupload");

const uuid = require("uuid");
const errorHandler = require("./errors/error-handler");
const server = express();

const http = require("http"); // More basic server than express.
const socketIO = require("socket.io");

const httpServer = http.createServer(server); // Need express

const socketServer = socketIO.listen(httpServer); // Need the http
const loginFilter = require("./middleware/login-filter");
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.use(cors());

server.use(express.json());

server.use(express.static(__dirname)); // Serve index.html

let userIdToSocketsMap = new Map();

// 2. Server got the client connection, and add its Socket to a Socket collection:
socketServer.sockets.on("connection", (socket) => {
  console.log("Connection request");
  var handshakeData = socket.request;
  let id = handshakeData._query["userId"];

  console.log("User id: " + id);
  userIdToSocketsMap.set(id, socket);

  console.log(
    "One client has been connected... Total clients: " + userIdToSocketsMap.size
  );
  // console.log(userIdToSocketsMap);
  // 4. Server got a message from one client:
  socket.on("edit-vacation", (msg) => {
    // console.log("Client sent message: " + JSON.stringify(msg));
    socket.broadcast.emit("edit-vacation", msg);
  });

  socket.on("delete-vacation", (msg) => {
    // console.log("Client sent message: " + JSON.stringify(msg));
    socket.broadcast.emit("delete-vacation", msg);
  });

  // 7. When user disconnects:
  socket.on("disconnect", () => {
    var handshakeData = socket.request;
    let userId = handshakeData._query["userId"];

    userIdToSocketsMap.delete(userId);
    console.log(
      userId +
        " client has been disconnected. Total clients: " +
        userIdToSocketsMap.size
    );
  });
});






if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

server.use(fileUpload());

server.post("/file", async (request, response) => {
  try {
    const vacation = request.body;
    const file = request.files.image;
    console.log(vacation);
    console.log(file);
    const extension = file.name.substr(file.name.lastIndexOf("."));
    let newUuidFileName = uuid.v4();
    vacation.imgSrcString =
      "http://localhost:3001/uploads/" + newUuidFileName + extension;
    console.log(vacation.imgSrcString);
    file.mv("./uploads/" + newUuidFileName + extension);
    if (vacation.vacationId === null || vacation.vacationId === undefined) {
      await vacationsLogic.addNewVacation(vacation);
    } else {
      await vacationsLogic.editVacation(vacation);
    }
    response.json(vacation);
  } catch (err) {
    response.status(500).send(err.message);
  }
});

server.use(loginFilter());
server.use("/users", usersController);

server.use("/vacations", vacationsController);

server.use(errorHandler);
httpServer.listen(3002, () => console.log("Listening..."));
server.listen(3001, () => console.log("Listening on http://localhost:3001"));
