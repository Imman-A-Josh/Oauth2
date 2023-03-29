const uuid = require("uuid");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const sql = require("../src/master/connection");
const { OAuthError } = require("oauth2-server");

const accessTokenSecret = process.env.jwtSecretKey || "dfghs3e";

var now = new Date();
now.setTime(now.getTime() + 1 * 60 * 1000);
let expiresIn = now;

module.exports = {
  getClient: (id, secret) => {
    let data = {
      id,
      grants: ["password", "refresh_token"],
      secret,
      scope: "read",
    };
    console.log(data);
    return data;
    // sql.query(`select * from client where id='${id}'`, (err, data) => {

    //   return data
    // //    {id: data[0].id, grands: ["password", "refresh_token"],secret: secret, scope: "read"};
    // });
  },
  saveToken: (token, client, user) => {
    let refreshToken_expired = new Date(token.refreshTokenExpiresAt);
    let data = {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      client: client,
      user: user,
      scope: token.scope,
      expires: expiresIn,
    };

    // return data
    sql.query(
      `insert into Token (user,client,refreshToken,accessToken,refreshToken_expired) values 
      ('${user.id}','${client.id}','${token.refreshToken}','${token.accessToken}','${refreshToken_expired}')`,
      (err, Data) => {
        if (err) {
          console.log(err);
        }
        console.log("saaaaave Token");
        throw new OAuthError("Server Error");
        // let data = {
        //   accessToken: token.accessToken,
        //   refreshToken: token.refreshToken,
        //   client: client,
        //   user: user,
        //   scope: token.scope,
        //   expires: expiresIn,
        // };
        // console.log(data);
        return data;
      }
    );
  },
  getAccessToken: async (token, accessToken) => {
    console.log(token, "++++____+++");
    try {
      let data = jsonwebtoken.verify(accessToken, accessTokenSecret, {
        algorithms: ["HS256"],
      });
      console.log(accessToken, "get Access Token");
      if (data) {
        return new Promise(async (resolve, reject) => {
          sql.query(
            `select * from Token where accessToken='${accessToken}'`,
            async (err, data) => {
              if (err) {
                console.log("getAccessToken");
                return reject;
              }
              console.log(data, "getAccessToken");
              var Data = data.user;
              // Data.user = data;
              Data.accessTokenExpiresAt = Data.refreshToken_expired;
              return resolve(Data);
            }
          );
        });
      }
    } catch (error) {
      return error;
    }
  },

  getUser: async (username, plainPassword) => {
    return new Promise(async (resolve, reject) => {
      if (!(username && plainPassword)) {
        new OAuthError("please enter username and password", {
          name: "no_username_or_password",
          code: 404,
        });
        return reject({
          message: "please enter username and password",
        });
      } else {
        sql.query(
          `select id,password from Users where username='${username}'`,
          async (err, data) => {
            if (data) {
              let temp = data;

              const Data = await bcrypt.compare(
                plainPassword,
                data[0].password
              );
              if (Data) {
                let userData = { username, id: data[0].id };
                return resolve(userData);
              } else {
                reject({ message: "wrong password" });
              }
            } else {
              const err = new AccessDeniedError("Bad Request", { code: 404 });
              reject(err);
            }
          }
        );
      }
    });
  },
  generateAccessToken: async (client, user, scope) => {
    return jsonwebtoken.sign({ ...user, client, scope }, accessTokenSecret, {
      expiresIn: "1h",
      algorithm: "HS256",
    });
  },
  revokeToken: (token, refreshToken) => {
    sql.query(
      `Update Token set refreshToken='${token.refreshToken}',refreshToken_expired='true'`,
      (err, data) => {
        if (err) {
          throw new InvalidTokenError("Access Token Expired");
        } else {
          console.log("revoke Token");
          return true;
        }
      }
    );
  },
  generateRefreshToken: async (client, user, scope) => {
    let refreshToken = await uuid.v4();
    console.log("generate Refresh Token", refreshToken);
    return refreshToken;
  },
  getRefreshToken: (refreshToken) => {
    sql.query(
      `select * from Token where refreshToken='${refreshToken}'`,
      (err, data1) => {
        if (err) {
          throw new InvalidTokenError("Refresh Token Expired");
        } else {
          let data2 = data1.client;
          sql.query(`select * from client where id='${data2}'`, (err, data) => {
            if (err) {
              throw new InvalidTokenError("Refresh Token Expired");
            } else {
              console.log("get Refresh Token");
              return data;
            }
          });
        }
      }
    );
  },
  verifyScope: (token, scope) => {
    throw new Error("Method not implemented");
    return false;
  },
  validateScope: (user, client, scope) => {
    return "read";
  },
};
