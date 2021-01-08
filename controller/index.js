const {
  user,
  project,
  todolist,
  users_projects,
  sequelize,
} = require('../models');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const {secret} = require('../config/config');

module.exports = {
  userinfo: async (req, res) => {
    const JWT = jwt.verify(req.cookies.accessToken, secret.secret_jwt);
    if (!JWT) {
      return res.status(401).send('need user session');
    }
    user
      .findOne({
        where: { email: JWT.userEmail },
        attributes: ['email', 'userName'],
        include: [
          {
            model: todolist,
            attributes: [
              [sequelize.fn('COUNT', 'id'), 'todoTotalCount'],
              [sequelize.literal(`SUM(IsChecked)`), 'todoDoneCount'],
            ],
          },
        ],
      })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },
  main: async (req, res) => {
    if (!req.cookies.accessToken){
      return res.status(401).send('need user session');
    }else{
      try{
        const JWT = jwt.verify(req.cookies.accessToken, secret.secret_jwt);
        let prId = await user.findOne({
          where: { email: JWT.userEmail },
          include: {
            model: project,
            attributes: ['id'],
            through: { attributes: [] },
          },
        });
        let prList = prId.projects.map((ele) => ele.id);
        let todoList = await Promise.all(
          prList.map(async (prID) =>{
            let obj = {};
            obj.id = prID;
            
            let projectName  = await project.findOne({
              where:{id:prID},
              attributes:['projectName']
            });

            obj.projectName = projectName.projectName;
            let todoLists = await todolist.findAll({
              where:{projectId:prID}
            });
            
            if(todoLists && todoLists.length>0){
              
              todoLists.map(todo=>{
                return todo.dataValues;
              }).forEach(todo=>{
                if(!obj[todo.createdAt]){
                  obj[todo.createdAt] = [];
                  obj[todo.createdAt].push(todo);
                }else{
                  obj[todo.createdAt].push(todo);
                }
              })
            }
            return obj;
          })
        );
        res.send(todoList);
      }catch(err){
        console.log(err);
      }
    }
  },

  projectinfo: async (req, res) => {
    let member = await project.findOne({
      where: { id: req.query.pid },
      attributes: [],
      include: {
        model: user,
        attributes: ['email'],
        through: { attributes: [] },
      },
    });
    try {
      let prtodo;
      let obj = {};
      let memberEmail = [];
      member.users.forEach((ele) => memberEmail.push(ele.email));
      obj['member'] = memberEmail;
      if (req.query.day) {
        prtodo = await project.findOne({
          where: { id: req.query.pid },
          attributes: ['adminUserId'],
          include: {
            model: todolist,
            where: { createdAt: req.query.day },
            attributes: ['id', 'body', 'IsChecked'],
            include: {
              model: user,
              attributes: ['userName'],
            },
          },
        });
      } else {
        prtodo = await project.findOne({
          where: { id: req.query.pid },
          attributes: ['adminUserId'],
          include: {
            model: todolist,
            attributes: ['id', 'body', 'IsChecked'],
            include: {
              model: user,
              attributes: ['userName'],
            },
          },
        });
      }
      if (prtodo) {
        obj['project'] = prtodo;
      } else {
        obj['project'] = {};
      }
      obj.project.adminUserId === req.session.userid
        ? (obj.project.adminUserId = true)
        : (obj.project.adminUserId = false);
      res.send(obj);
    } catch (error) {
      console.log(error);
    }
  },
  logincheck: async(req,res)=>{
    try{
      const JWT = jwt.verify(req.cookies.accessToken, secret.secret_jwt);
      console.log(JWT);
      if(JWT){
        res.status(200).send();
      }else{
        res.status(404).send();
      }
    }catch(err){
      res.status(404).send();
    }
    
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    user
      .findOne({
        where: {
          email: email,
          password: password
        },
      })
      .then(async (result) => {
        if (result === null) {
          res.status(404).send('Invalid user or Wrong password');
        } else {

          let userId = await user.findOne({
            where: { email: email },
            attributes: ['id']
          });

          const accessToken = jwt.sign({
            userEmail: email,
            userId:userId.id
          },
          secret.secret_jwt,
          {expiresIn:"7d"});
          res.cookie('accessToken', accessToken);
          res.status(200).json({
            id: result.id,
            email: result.email,
            userName: result.userName,
            password: result.password,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  },
  logout: async (req, res) => {
    try{
      res.clearCookie("accessToken")
      res.status(200).send();
    }catch(err){
      console.log(err);
      res.status(500).end();
    }
    
  },
  userpost: async (req, res) => {
    const { email, userName, password } = req.body;

    try {
      if (!email || !password || !userName) {
        res.status(422).send('insufficient parameters supplied');
      } else {
        user
          .findOrCreate({
            where: {
              email: email,
            },
            defaults: {
              password: password,
              userName: userName,
            },
          })
          .then(async ([user, created]) => {
            if (!created) {
              return res.status(409).send('email exists');
            }
            const data = await user.get({ plain: true });
            res.status(201).json(`id:${data.id}`);
          })
          .catch((err) => {
            res.status(500).send(err);
          });
      }
    } catch (err){
      console.log(err)
    }
  },
  projectpost: async (req, res) => {
    const { projectName, member } = req.body;
    const JWT = jwt.verify(req.cookies.accessToken, secret.secret_jwt);

    if (!projectName) {
      res.status(422).send('insufficient parameters supplied');
    } else if (!JWT) {
      res.status(422).send('you are not login');
    } else {

      let prId = await user.findOne({
        where: { email: JWT.userEmail },
        attributes:['id']
      });

      res.status(201).json();
      project
        .create({
          projectName: projectName,
          adminUserId: prId.id,
        })
        .then(async (project) => {
          const data = await project.get({ plain: true });
          let currentEmail;
          let memberuser;

          users_projects.create({
            projectId: data.id,
            userId: prId.id,
          });

          if (member) {
            for (let i = 0; i < member.length; i++) {
              currentEmail = member[i];
              memberuser = await user.findOne({
                where: { email: currentEmail },
              });

              users_projects.create({
                projectId: data.id,
                userId: memberuser.id,
              });
            }
          }
          res.status(201).json(data);
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    }
  },
  todolistpost: async (req, res) => {
    const { body, projectId } = req.body;
    let currentUserId;
    const JWT = jwt.verify(req.cookies.accessToken, secret.secret_jwt);
    if (!body || !projectId) {
      res.status(422).send('insufficient parameters supplied');
    } else {
      currentUserId = JWT.userId;
      todolist
        .create({
          body: body,
          projectId: projectId,
          userId: currentUserId,
          IsChecked: false
        })
        .then(async (todolist) => {
          const data = await todolist.get({ plain: true });
          res.status(201).json(data);
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    }
  },
  passwordchange: async(req,res)=>{
    const { currentPassword, newPassword } = req.body;

    const JWT = jwt.verify(req.cookies.accessToken, secret.secret_jwt);
    
    let result;
    let hasingPassword;
    let userCurrent = await user.findByPk(JWT.userId);
    console.log(userCurrent);
    if (currentPassword !== null) {
      let shasum = crypto.createHmac('sha512', process.env.CRYPTO_KEY);
      shasum.update(currentPassword);
      hasingPassword = shasum.digest('hex');

      if (newPassword !== null) {
        if (hasingPassword === userCurrent.password) {
          let new_shasum = crypto.createHmac('sha512', process.env.CRYPTO_KEY);
          new_shasum.update(newPassword);
          hasingPassword = new_shasum.digest('hex');
          userCurrent.password = hasingPassword;
          console.log(userCurrent);
          result = await userCurrent.save();
          console.log(result);
          res.status(202).json(`id:${result.id}`);
        } else {
          res.status(422).send('password not right');
        }
      }else{
        res.status(422).send('password not right');
      }
    }else{
      res.status(422).send('password not right');
    }
  },
  userchange: async (req, res) => {
    const { userName } = req.body;

    const JWT = jwt.verify(req.cookies.accessToken, secret.secret_jwt);
    
    let result;
    let userCurrent = await user.findByPk(JWT.userId);

    console.log(userCurrent);
    if (userName !== undefined) {
      userCurrent.userName = userName;
      result = await userCurrent.save();
      res.status(202).json(`id:${result.id}`);
    }
  },
  projectchange: async (req, res) => {
    const { id, projectName, member } = req.body;

    let currentProject = await project.findByPk(id);

    if (projectName !== null) {
      currentProject.projectName = projectName;
    }
    if (member !== null) {
      for (let i = 0; i < member.length; i++) {
        let currentEmail = member[i];
        let memberuser = await user.findOne({ where: { email: currentEmail } });

        users_projects.create({
          projectId: id,
          userId: memberuser.id,
        });
      }
    }

    let result = await currentProject.save();
    res.status(202).json(result);
  },
  todolistchange: async (req, res) => {
    const { id, IsChecked } = req.body;

    let currentTodolist = await todolist.findByPk(id);

    if (IsChecked !== null) {
      currentTodolist.IsChecked = IsChecked;
    }

    await currentTodolist.save();
    res.status(202).send(currentTodolist);
  },
  projectdelete: async (req, res) => {
    // 프로젝트 삭제시 프로젝트와 연관된 todolist도 같이 삭제 되어야 함,

    const { id } = req.body;

    await todolist.destroy({ where: { projectId: id } }); // 연관된 todolist 삭제
    await users_projects.destroy({ where: { projectId: id } }); // 연관된 todolist 삭제

    let currentProject = await project.findOne({ where: { id: id } }); // project 삭제
    await currentProject.destroy();
    res.status(202).json(`id:${id}`);
  },
  todolistdelete: async (req, res) => {
    // toddlist는 list 한 개만 삭제 해야 함.

    const { id } = req.body;
    let todolistId = id;

    let currentTodolist = await todolist.findByPk(todolistId);
    await currentTodolist.destroy();
    res.status(202).json(`id:${id}`);
  },
  usercheck: async (req, res) => {
    const { email } = req.body;
    let memberuser = await user.findOne({ where: { email: email } });
    let userId = memberuser && memberuser.id;
    if (userId) {
      await user.findByPk(userId).catch((err) => {
        res.status(500).send(err);
      });
      res.status(200).json({ isUser: true });
    } else {
      res.status(200).json({ isUser: false });
    }
  },
};
