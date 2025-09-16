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

app.post("/form", async (req, res) => {
  await checkToken(req);

  let envelopesApi = getEnvelopesApi(req);

  //make envelope request body
  let envelope = makeEnvelope(req.body.name, req.body.email);

  let results = await envelopesApi.createEnvelope(process.env.account_id, {
    envelopeDefinition: envelope,
  });
  console.log("Envelope results : ", results);
  res.send("received form data");
});

getEnvelopesApi = (req) => {
  let dsaApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.base_path);
  dsApiClient.addDefaultHeader(
    "Authorization",
    "Bearer" + req.session.access_token
  );

  return new docusign.EnvelopesApi(dsApiClient);
};

getEnvelopesApi = (req) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(process.env.base_path);
  dsApiClient.addDefaultHeader(
    "Authorization",
    "Bearer" + req.session.access_token
  );
  return new docusign.EnvelopesApi(dsApiClient);
};

function makeEnvelope(name, email) {
  // Data for this method
  // args.signerEmail
  // args.signerName
  // args.templateId

  // The envelope has two recipients.
  // recipient 1 - signer
  // recipient 2 - cc

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.templateId = process.env.template_id;

  // Create template role elements to connect the signer and cc recipients
  // to the template
  // We're setting the parameters via the object creation
  let signer1 = docusign.TemplateRole.constructFromObject({
    email: this.email,
    name: this.name,
    clientUserId: process.env.client_user_id,
    roleName: "Applicant",
  });

  // Add the TemplateRole objects to the envelope object
  env.templateRoles = [signer1];
  env.status = "sent";
  return env;
}

makeRecipentViewRequest=()=>{
  let viewRequest = new docusign.RecipentViewRequest();
}

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

app.get("/success", (req, res) => {
  res.send("Success");
});

app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});

//https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=a4141527-c338-45ae-84c1-f4446b2e2888&redirect_uri=http://localhost:3000/
