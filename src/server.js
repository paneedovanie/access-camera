const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
const path = require("path");
const { runPuppeteer } = require("./modules/puppeteer");
const { runSocket } = require("./modules/socket");
const { uploadFile } = require("./modules/gapi");
const public = path.join(__dirname, "dist");
const multer = require("multer");

runSocket(server);

app.use(cors());

app.use("/", express.static(path.join(public)));

app.get("/camera", function (req, res) {
  res.sendFile(path.join(__dirname + "/public", "camera.html"));
});

app.post("/api/upload", multer().single("file"), async (req, res) => {
  uploadFile(req.file);
});

app.get("/*", function (req, res) {
  res.sendFile(path.join(public, "index.html"));
});

server.listen(5000, () => {
  console.log("listening on *:5000");
  runPuppeteer();
});
