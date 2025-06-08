import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connect", (socket) => {
  console.log("Connected to socket");

  // For socket disconnection handling
  socket.on("disconnect", () => {
    console.log("Disconnected from socket");
  });

  // Creating a room for projectId
  socket.on("join_project", (projectId) => {
    console.log(`Socket joined project: ${projectId}`);
    socket.join(projectId);
  });

  // Leaving a room
  socket.on("leave_project", (projectId) => {
    console.log(`Socket left project: ${projectId}`);
    socket.leave(projectId);
  });
});

app.post("/emit-commit", (req, res) => {
  try {
    console.log("Received commit event");
    const data = req.body;
    console.log("Data received:", data);
    if (!data || !data.projectId) {
      return res.status(400).send("Bad Request: Missing projectId");
    }
    io.to(data.projectId).emit("new_commit", data);
    res.status(200).send("Event emitted successfully");
  } catch (error) {
    console.error("Error processing commit event:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/emit-addTask", (req, res) => {
  try {
    console.log("Received addTask event");
    const data = req.body;
    console.log("Data received:", data);
    if (!data || !data.projectId) {
      return res.status(400).send("Bad Request: Missing projectId");
    }
    io.to(data.projectId).emit("new_task", data);
    res.status(200).send("Event emitted successfully");
  } catch (error) {
    console.error("Error processing addTask event:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/emit-assignTask", (req, res) => {
  try {
    console.log("Received assignTask event");
    const data = req.body;
    console.log("Data received:", data);
    if (!data || !data.projectId) {
      return res.status(400).send("Bad Request: Missing projectId");
    }
    io.to(data.projectId).emit("task_assigned", data);
    res.status(200).send("Event emitted successfully");
  } catch (error) {
    console.log("Error processing assignTask event:", error);
    return res.status(500).send("Internal Server Error in emit-assignTask");
  }
});

app.post("/emit-completeTask", (req, res) => {
  try {
    console.log("Received completeTask event");
    const data = req.body;
    console.log("Data received:", data);
    if (!data || !data.projectId) {
      return res.status(400).send("Bad Request: Missing projectId");
    }
    io.to(data.projectId).emit("task_completed", data);
    res.status(200).send("Event emitted successfully");
  } catch (error) {
    console.error("Error processing completeTask event:", error);
    return res.status(500).send("Internal Server Error in emit-completeTask");
  }
});

server.listen(4000, () => {
  console.log("Socket server is running on port 4000");
});
