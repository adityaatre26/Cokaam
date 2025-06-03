import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("Connected to socket");
  socket.on("disconnect", () => {
    console.log("Disconnected from socket");
  });
});

app.post("/emit-commit", (req, res) => {
  try {
    console.log("Received commit event");
    console.log(req.body);
    const data = req.body;
    io.emit("new_commit", data);
    res.status(200).send("Event emitted successfully");
  } catch (error) {
    console.error("Error processing commit event:", error);
    return res.status(500).send("Internal Server Error");
  }
});

server.listen(4000, () => {
  console.log("Socket server is running on port 4000");
});
