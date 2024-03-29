const express = require("express");
const socket = require("socket.io");
const helmet = require("helmet");

const PORT = 5000;
const app = express();
const server = app.listen(process.env.PORT || PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

app.use(express.static("public"));

app.use(helmet());
app.disable('x-powered-by');

const io = socket(server);

const activeUsers = new Set();

io.on("connection", function (socket) {
    console.log("Made socket connection");

    socket.on("new user", function (data) {
        socket.userId = data;
        activeUsers.add(data);
        io.emit("new user", [...activeUsers]);
    });

    socket.on("disconnect", () => {
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", socket.userId);
    });

    socket.on("chat message", function (data) {
        io.emit("chat message", data);
    });

    socket.on("typing", function (data) {
        socket.broadcast.emit("typing", data);
    });
});