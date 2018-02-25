const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

var config = {};

try {
  var config = require("./config.json");
} catch (err) {
  console.log("\'config.json\' file is invalid or missing, using defaults.");
}

const mimeTypes = require("./mimeTypes.js");

const conPort = config.port || 9542;
const conPath = config.path || "./public";

http.createServer((req, res) => {

  console.log(req.method + " at " + req.url + "\n");

  const fileUrl = url.parse(req.url).pathname;
  var filePath = (conPath + fileUrl).replace(/[.]{2,}/g, ".");

  fs.exists(filePath, (exist) => {

    if (!exist) {

      if (path.parse(filePath).ext == "") {

        filePath += ".html";

        if (!fs.existsSync(filePath)) {
          res.statusCode = 404;
          res.end("File not found!");
          return;
        }
      } else {
        res.statusCode = 404;
        res.end("File not found!");
        return;
      }
    }

    if (fs.statSync(filePath).isDirectory()) {
      if (filePath.slice(-1) != "/") {
        res.writeHead(301, {
          Location: "http" + (req.socket.encrypted ? "s" : "") + "://" + req.headers.host + filePath.replace(conPath, "") + "/"
      }); res.end(); return;
      } else {
        filePath += "./index.html";
      }
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end("Error getting the file.")
      } else {
        const ext = path.parse(filePath).ext;
        res.setHeader("Content-type", mimeTypes[ext] || "text/plain");
        res.end(data);
      }

    });

  });

}).listen(parseInt(conPort));

console.log("Server live at " + conPort + "\n");
