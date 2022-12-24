const puppeteer = require("puppeteer");
const fs = require("fs");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const cors = require("cors");
const path = require("path");
const public = path.join(__dirname, "dist");

let cameraIndex = 0;
let clientIndex = 0;

app.use(cors());

app.use("/", express.static(path.join(public)));

app.get("/camera", function (req, res) {
  res.sendFile(path.join(__dirname + "/public", "camera.html"));
});

app.get("/*", function (req, res) {
  res.sendFile(path.join(public, "index.html"));
});

io.on("connection", async (socket) => {
  const type = socket.handshake.query.type;
  socket.join(type);
  console.log(socket.handshake.query);

  if (type === "client") {
    const sockets = await socket.to("camera").fetchSockets();
    console.log(
      "client",
      sockets.map(({ id }) => id)
    );
    socket.emit(
      "camera-sockets",
      sockets.map(({ id, handshake }) => ({
        id,
        cameras: JSON.parse(handshake.query.cameras),
      }))
    );
  }

  // socket.on("message", (message) => {
  //   console.log("message", message);
  // });
  socket.on("offer", ({ to, offer }) => {
    socket.to(to).emit("offer", { from: socket.id, offer });
  });
  socket.on("answer", ({ to, answer }) => {
    socket.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("candidate", ({ to, candidate }) => {
    socket.to(to).emit("candidate", { from: socket.id, candidate });
  });
  socket.on("select-camera", ({ to, deviceId }) => {
    socket.to(to).emit("select-camera", { from: socket.id, deviceId });
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
  page
    .on("console", (message) =>
      console.log(
        `${message.type().substr(0, 3).toUpperCase()} ${message.text()}`
      )
    )
    .on("pageerror", ({ message }) => console.log(message))
    // .on("response", (response) =>
    //   console.log(`${response.status()} ${response.url()}`)
    // )
    .on("requestfailed", (request) =>
      console.log(`${request.failure().errorText} ${request.url()}`)
    );
  //   const contentHtml = fs.readFileSync(__dirname + "/index.html", "utf8");
  await page.goto("http://localhost:5000/camera");
  // const cdp = await page.target().createCDPSession();
  // await cdp.send("Network.enable");
  // await cdp.send("Page.enable");

  // const printResponse = (response) => console.log("response: ", response);

  // cdp.on("Network.webSocketFrameReceived", printResponse); // Fired when WebSocket message is received.
  // cdp.on("Network.webSocketFrameSent", printResponse); // Fir

  // const data = await page.evaluate(() => document.querySelector("*").outerHTML);

  // console.log(data);

  await page.exposeFunction("log", console.log);

  // await page.evaluate(async () => {
  //   // use window.readfile to read contents of a file
  //   // const content = await window.readfile("/etc/hosts");
  // });
  // video session starts without prompt
  // return browser.close();
};
