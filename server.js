const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const docusign = require("docusign-esign");
const fs = require("fs");
const session = require("express-session");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "mjm984645mm",
    resave: true,
    saveUninitialized: true,
  })
);

dotenv.config();

app.post("/form", (req, res) => {
  const data = req.body;
  console.log("received form data", req.body);
  //res.send({ "Form Data": req.body });
  res.send({ "form data": data });
});

getEnvelopesApi=(req)=>{
  let dsaApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.base_path);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer' + req.session.access_token);

  return new docusign.EnvelopesApi(dsApiClient);
}

getEnvelopesApi = (req) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.base_path);
  dsApiClient.addDefaultHeader(
    "Authorization",
    "Bearer" + req.session.access_token
  );
  return new docusign.EnvelopesApi(dsApiClient);
};

checkToken = async (req) => {
  if (req.session.access_token && Date.now() < req.session.expires_at) {
    console.log("re-using access_token", req);
  } else {
    console.log("generating new access token");
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(process.env.base_path);
    const results = await dsApiClient.requestJWTUserToken(
      process.env.integration_key,
      process.env.user_id,
      "signature",
      fs.readFileSync(path.join(__dirname, "private.key")),
      3600
    );
    console.log(results.body);
    req.session.access_token = results.body.access_token;
    req.session.expires_at = Date.now() + (results.body.expires_in - 60) * 1000;
  }
};

app.get("/", async (req, res) => {
  await checkToken(req);
  res.sendFile(path.join(__dirname, "main.html"));
});

app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});

//https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=a4141527-c338-45ae-84c1-f4446b2e2888&redirect_uri=http://localhost:3000/
