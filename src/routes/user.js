
module.exports = app => {
    const User = require("../controller/user")

    //
    app.post('/api/user', User.login);   

    //
    app.post('/api/user',User.newuser)   

    // app.get('/user/get', User.get);  

}