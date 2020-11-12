<<<<<<< HEAD
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
=======
const { user,project,todolist,users_projects } = require('../../models');

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
    res.status(200).end();
  },
  logout: async (req, res) => {
    res.status(200).end();
  },
  userpost: async (req, res) => {
    res.status(200).end();
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
>>>>>>> 8590394ed187adec0a0e6b96823128d4dba42e3b
