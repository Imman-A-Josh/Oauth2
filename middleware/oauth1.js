const oauth2Server = require("oauth2-server");
const option = require("./oauth20");

module.exports = function (req, res, next) {
  const request = new oauth2Server.Request(req);
  const response = new oauth2Server.Response(res);
  request.headers["content-type"] = "application/x-www-form-urlencoded";
  const server = new oauth2Server({
    model: option,
    accessTokenLifetime: 3600,
    allowExtendedTokenAttributes: true,
  });

  //deasd
  if (req.originalUrl === "/token/auth") {
    server
      .token(request, response)
      .then((token) => {
        res.send(token);
      })
      .catch((err) => {
        console.log(err);
        err.statusCode
          ? res.status(err.statusCode).json(err)
          : res.send(err).status(400);
      });
    return;
  }
  if (req.originalUrl === "/user/login") {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
      server
        .token(request, response)
        .then((token) => {
          res.send(token);
        })
        .catch((err) => {
          console.log(err, "------------------------------");
          err.statusCode
            ? res.status(err.statusCode).json(err)
            : res.send(err).status(400);
        });
    } else {
      res.json({ message: "please enter username and password" });
    }
  } else {
    let token = req.headers.authorization.split(" ") || "";
    if (token[1]) {
      server
        .authenticate(request, response)
        .then((token) => {
          // return res.send(token);
          next();
        })
        .catch((err) => {
          return err.statusCode
            ? res.status(err.statusCode).json(err)
            : res.send(err).status(400);
        });
    }
  }
};
