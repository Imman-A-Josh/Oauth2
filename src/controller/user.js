

const bcrypt = require('bcrypt');
const User   = require('../model/user');

//asdasd
exports.login = async (req, res) => {
  
    User.login(req.body, (err,data)=>{
        if (err)
        res.status(500).send({
            message:
                err.message || "Some error occurred while creating the users."
        });
    else res.status(200).send(data);
});
}   
//asdasd
exports.newuser = async (req, res) => {

    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    try {

        var Value = req.body.password;
        const salt = await bcrypt.genSalt(5);
        Value = await bcrypt.hash(Value, salt);
    }
    catch {
        console.log("error");
    }

    var user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        password: Value
    })


    User.newuser(user, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the users."
            });
        else res.send(data);
    });
}