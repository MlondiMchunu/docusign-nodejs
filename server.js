const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv")

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config();

app.post("/form", (req, res) => {
    const data = req.body
  console.log("received form data", req.body);
  //res.send({ "Form Data": req.body });
  res.send({"form data":data})
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});
