const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerDocument = require("../swagger.js");
const basicAuth = require("express-basic-auth");
const { PROJECT_NAME } = process.env;

// *****Swagger api doc***/
const options = {
   definition: {
      openapi: "3.0.0",
      info: {
         title: PROJECT_NAME,
         version: "1.0.0",
      },
   },
   apis: ["../routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
const { IS_SECURE_SWAGGER } = process.env;

// authorization function
const authorizationHandler = (username, password, cb) => {
   const { SWAGGER_AUTH_USERNAME, SWAGGER_AUTH_PASSWORD } = process.env;
   if (
      username === SWAGGER_AUTH_USERNAME &&
    password === SWAGGER_AUTH_PASSWORD
   ) {
      return cb(null, true);
   } else {
      return cb(null, false);
   }
};

// unauthorized request function
function getUnauthorizedResponse(req) {
   return req.auth ? `Credentials ${  req.auth.user  }:${  req.auth.password  } 
   rejected` : "No credentials provided";
}

// secure a swagger with condition
const customAuthorizerAuth =
  IS_SECURE_SWAGGER === "true" ? basicAuth({
     authorizer: authorizationHandler,
     challenge: true,
     authorizeAsync: true,
     unauthorizedResponse: getUnauthorizedResponse,
  }) : function (req, res, next) {
     next();
  };

const swaggerDoc = (server) => {
   // Swagger page
   server.use(
      "/api-docs",
      customAuthorizerAuth,
      (req, res, next) => {
         swaggerDocument.host = `${req.get("host")  }/prod`;
         // eslint-disable-next-line no-param-reassign
         req.swaggerDoc = swaggerDocument;
         next();
      },
      swaggerUi.serveFiles(swaggerDocument, options),
      swaggerUi.setup(),
   );

   // Docs in JSON format
   server.get("/api-docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
   });


};

module.exports = swaggerDoc;
