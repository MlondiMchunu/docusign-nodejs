const express = require("express");
const path = require("path");
const bodyParser = require("body-parser")

const app = express();
app.use(bodyParser.urlencoded({extended:true}))


app.post("/form",(req,res)=>{
console.log("received form data",req.body);
res.send("Form Received!")
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"))
});

app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});
