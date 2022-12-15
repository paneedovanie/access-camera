const puppeteer = require("puppeteer");
const fs = require("fs");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require("cors");
const path = require("path");
const public = path.join(__dirname, "public");

app.use(
  cors({
    origin: null,
  })
);

app.use("/", express.static(path.join(public)));

app.get("/sample", function (req, res) {
  res.sendFile(path.join(public, "sample.html"));
});

app.get("/", function (req, res) {
  res.sendFile(path.join(public, "client.html"));
});

app.get("/camera", function (req, res) {
  res.sendFile(path.join(public, "camera.html"));
});

io.on("connection", (socket) => {
  console.log(socket.handshake.query.type);
  socket.join(socket.handshake.query.type);

  console.log(socket.handshake.query.type, "connected");
  socket.emit("message", "Welcome!");

  socket.on("message", (message) => {
    console.log("message", message);
  });

  socket.on("offer", (offer) => {
    socket.to("camera").emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.to("client").emit("answer", answer);
  });

  socket.on("new-ice-candidate", (message) => {
    if (socket.handshake.query.type === "camera")
      socket.to("client").emit("new-ice-candidate", message);
    if (socket.handshake.query.type === "client")
      socket.to("camera").emit("new-ice-candidate", message);
  });
});

server.listen(5000, () => {
  console.log("listening on *:5000");
  runPuppeteer();
});

const runPuppeteer = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--use-fake-ui-for-media-stream"],
  });
  const page = await browser.newPage();
  //   const contentHtml = fs.readFileSync(__dirname + "/index.html", "utf8");
  await page.goto("http://localhost:5000/camera");

  await page.exposeFunction("log", console.log);

  await page.evaluate(async () => {
    // use window.readfile to read contents of a file
    // const content = await window.readfile("/etc/hosts");
  });
  // video session starts without prompt
  // return browser.close();
};
