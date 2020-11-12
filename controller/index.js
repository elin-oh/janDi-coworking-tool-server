const { user, project, todolist, users_projects } = require("../models");

module.exports = {
    signInController: (req, res) => {
        //로그인 /login

        const { email, password } = req.body;
        var sess = req.session;

        user
            .findOne({
                where: {
                    email: email,
                    password: password
                }
            })
            .then(result => {
                if (result === null) {
                    res.status(404).send('Invalid user or Wrong password');
                } else {
                    sess.userid = result.id;

                    res.status(200).json({
                        id: result.id
                    });
                }
            })
            .catch(err => {
                res.status(404).send(err);
            });
    },


};