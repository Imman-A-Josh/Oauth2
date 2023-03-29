const oauth20 = require("./middleware/oauth1");

const express = require("express");
const socket=require('socket.io')
const websocket = require("./websocket");
const changesInDatabase = require("./src/master/connection");

const app = express();

app.use(express.json());
app.use(oauth20);

app.get("/get", (req, res) => {
  res.send("Hello World");
});

console.log(__dirname);

require("./src/routes/user")(app);

const server = app.listen(2000, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:2000`);
  });
  const io = new socket.Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    },
  });
//  function changesInUserDocument(io,socket){
//     socket.emit('eventname',{message:"hello world"})
//   }
  const onConnection = (socket) => {
    changesInDatabase(io, socket);
  };
  io.on("connection", onConnection);
