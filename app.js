const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const mailerFunctionality = require("./routes/mailer");

const hostingClient = process.env.HOST_CLIENT;
// console.log(hostingClient);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: hostingClient,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("notification", (data) => {
    socket.emit("receive_message", data.notification);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

//----------- This is testing rotut -----------//
app.get("/api/home", (req, res) => {
  try {
    res.json({ message: "This is home route" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Internal Server 500" });
  }
});

// ------------- For route to send Email ----------//
app.post("/api/send-email", (req, res) => {
  const { email, subject, text } = req.body;
  try {
    mailerFunctionality.sendEmail(email, subject, text);
    res.json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server running on ${port}`);
});
