const puppeteer = require("puppeteer");

module.exports.runPuppeteer = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--use-fake-ui-for-media-stream"],
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
