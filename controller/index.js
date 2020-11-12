const { user, project, todolist, users_projects } = require('../../models');

module.exports = {
  
    userinfo: async (req, res) => {
        res.status(200).end();
    },
    projectinfo: async (req, res) => {
        res.status(200).end();
    },
    todolistinfo: async (req, res) => {
        res.status(200).end();
    },
    user_project: async (req, res) => {
        res.status(200).end();
    },
    login: async (req, res) => {


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
    logout: async (req, res) => {

        var sess = req.session;

        if (sess === null) {

            res.status(400).send('you are currently not logined');
        }
        else {

            sess.destroy(err => {

                if (err) {
                    console.log(err);
                } else {
                    res.status(205).send("successfully signed out!");
                }
            });
        }


    },
    userpost: async (req, res) => {

        const { email, userName, password } = req.body;

        if (!email || !password || !userName) {
            res.status(422).send('insufficient parameters supplied');
        }
        else {

            user
                .findOrCreate({
                    where: {
                        email: email
                    },
                    defaults: {
                        password: password,
                        userName: userName,
                    }
                })
                .then(async ([user, created]) => {
                    if (!created) {
                        return res.status(409).send('email exists');
                    }
                    const data = await user.get({ plain: true });
                    res.status(201).json(data);
                });

        }

    },
    projectpost: async (req, res) => {
        res.status(200).end();
    },
    todolistpost: async (req, res) => {
        res.status(200).end();
    },
    userchange: async (req, res) => {
        res.status(200).end();
    },
    projectchange: async (req, res) => {
        res.status(200).end();
    },
    todolistchange: async (req, res) => {
        res.status(200).end();
    },
    projectdelete: async (req, res) => {
        res.status(200).end();
    },
    todolistdelete: async (req, res) => {
        res.status(200).end();
    },

}
