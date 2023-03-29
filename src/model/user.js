

const bcrypt = require("bcrypt");

const sql = require("../master/connection");

var User = function (user) {
  this.id = user.id;
  this.firstName = user.firstName;
  this.lastName = user.lastName;
  this.email = user.email;
  this.password = user.password;
  this.phone = user.phone;
};

User.newuser = (user, result) => {

  sql.query(`insert into Users SET ?`, user, (err, res) => {
    if (err) {
      console.log(err);
      result(err, null);
      return;
    }
    console.log("SuccessFully Added the data");
    result(null, { id: res.insertId, ...user });
  });
};

//
User.login = async (data, result) => {
  let username = data.username;

  insertquery = `select * from Users where username='${username}'`;
  sql.query(insertquery, async (err, res) => {
    if (err) {
      console.log(err);
      result(null, err);
    }
    if (res == 0) {
      result(null, { message: "Username is Wrong" });
      console.log("Username is Wrong");
    } else {
      const token   = generateToken();
      var password  = data.password.toString();
      let value = res.pop();
      var loginid = value.id;
      var password2 = value.password;

      //
      const data1 = await bcrypt.compare(password, password2);
      if (data1) {
        sql.query(
          `Insert into UserSession (loginid,token,status) values ('${loginid}','${token}','active')`,
          (err, res) => {

            result(null, { username: username, id: loginid, token: token });
          }
        );
      } else {
        result(null, { message: "Password is wrong" });
      }
    }
  });
};

function generateToken() {
  const N = 30;
  return Array(N + 1)
    .join((Math.random().toString(36) + "00000000000000000").slice(2, 18))
    .slice(0, N);
}

module.exports = User;
