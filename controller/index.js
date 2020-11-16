const { user, project, todolist, sequelize } = require('../models');

module.exports = {  
  userinfo: async (req, res) => {
    if(!req.session.userid){
        return res.status(401).send('need user session')
    }
    user
    .findOne({  
      where: { id: req.session.userid },
      attributes: ['password'],
      include: [{
        model: todolist,
        attributes:[
            [sequelize.fn('COUNT', '*'), 'todoTotalCount'],
            [sequelize.fn('COUNT', sequelize.col('IsChecked')), 'todoDoneCount']
        ],
        having: ["COUNT(todolist.IsChecked) = true"]
      }]
    })
    .then(result => {
        res.status(200).json(result)  
    })
    .catch(err => {
        res.status(500).send(err);
    });
    
  },
  maininfo: async (req, res) => { 
    if(!req.session.userid){
        return res.status(401).send('need user session')
    }
    user
    .findOne({
      where: { id: req.session.userid },
      attributes: [],
      include: {
        model: project,
        attributes: ['id', 'projectName'],
        through: {attributes: []},
        include: {
            model: todolist,
            attributes: ['createdAt', [sequelize.fn('COUNT', 'createdAt'), 'COUNT']],
            group: 'createdAt',
            order: ['createdAt'],
            separate: true
          }, 
      }
    })
    .then(result => {
        res.status(200).json(result['projects'])
    })
    .catch(err => {
        res.status(500).send(err);
    });
  },

  projectinfo: async (req, res) => { 
    // if(!req.session.userid){
    //     return res.status(401).send('need user session')
    // }
    if(req.query.day){
        user
        .findOne({
          where: { id: req.session.userid },
          attributes: [],
          include: {
            model: project,
            attributes: ['id', 'projectName','adminUserId'],
            through: {attributes: []},
            include: {
                model: todolist,
                where: { createdAt: req.query.day },
                attributes: ['id','body', 'IsChecked']
            }
          }
        })
        .then(result => {  
            res.status(200).json(result.projects)
        })
        .catch(err => {
            res.status(500).send(err);
        });
    }
    else{
        user
        .findOne({
          where: { id: 1 },
          include: {
            model: project,
            attributes: ['id', 'projectName','adminUserId'],
            right: true,
            through: {attributes: []},
            include: {
                model: todolist,
                attributes: ['id','body', 'IsChecked']
            }            
          }
        })
        .then(result => {  
            res.status(200).json(result.projects)
        })
    }
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
        } 
        else {
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
