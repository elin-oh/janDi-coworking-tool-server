const { user,project,todolist,users_projects } = require('../models');

module.exports = {
  userinfo: async (req, res) => {
    if(!req.session.userid){
      res.status(401).send('need user session')  //유저세션필요
    }
    else{
      user
      .findOne({
        where: {
          id:req.session.userid
        }
      })
      .then(result => {
          res.status(200).json(result)
      })
    }
  },

  projectinfo: async (req, res) => {  //프로젝트 정보 출력
    project
    .findOne({
      where: {
        id:req.session.projectid
      }
    })
    .then(result => {  //result 없을 경우 404
        res.status(200).json(result)
    })
  },

  todolistinfo: async (req, res) => {  //투두 리스트 출력
    todolist
    .findOne({
      where: {
        id:req.session.todolistid
      }
    })
    .then(result => {  //result 없을 경우 404
        res.status(200).json(result)
    })
  },

  user_project: async (req, res) => {  //프로젝트 목록 출력
    todolist
    .findOne({
      where: {
        id:req.session.todolistid
      }
    })
    .then(result => {  //result 없을 경우 404
        res.status(200).json(result)
    })
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
