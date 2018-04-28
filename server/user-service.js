const fetch = require("node-fetch");
const request = require("request");
const authService = require("./auth-service");

function getGraphToken(tid, token) {
  return authService.exchangeForToken(
    tid,
    token,
    "https://graph.microsoft.com"
  );
}

function getImage(req, res) {
  getGraphToken(req.authInfo.tid, req.token)
    .then(token => {
      request("https://graph.microsoft.com/v1.0/me/photo/$value", {
        headers: { Authorization: `Bearer ${token}` }
      }).pipe(res);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send(error);
    });
}

module.exports = {
  getImage
};
