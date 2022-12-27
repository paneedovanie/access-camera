const { Server } = require("socket.io");

module.exports.runSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
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
};
