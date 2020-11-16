const { user, project, todolist, users_projects, sequelize } = require('../models');

module.exports = {
    userinfo: async (req, res) => {
        if (!req.session.userid) {
            return res.status(401).send('need user session')
        }
        user
            .findOne({
                where: { id: req.session.userid },
                attributes: ['password'],
                include: [{
                    model: todolist,
                    attributes: [
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
        if (!req.session.userid) {
            return res.status(401).send('need user session')
        }
        user
            .findOne({
                where: { id: req.session.userid },
                attributes: [],
                include: {
                    model: project,
                    attributes: ['id', 'projectName'],
                    through: { attributes: [] },
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
        if (req.query.day) {
            user
                .findOne({
                    where: { id: req.session.userid },
                    attributes: [],
                    include: {
                        model: project,
                        attributes: ['id', 'projectName', 'adminUserId'],
                        through: { attributes: [] },
                        include: {
                            model: todolist,
                            where: { createdAt: req.query.day },
                            attributes: ['id', 'body', 'IsChecked']
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
        else {
            user
                .findOne({
                    where: { id: 1 },
                    include: {
                        model: project,
                        attributes: ['id', 'projectName', 'adminUserId'],
                        right: true,
                        through: { attributes: [] },
                        include: {
                            model: todolist,
                            attributes: ['id', 'body', 'IsChecked']
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
                        id: result.id,
                        email: result.email,
                        userName: result.userName
                    });
                }
            })
            .catch(err => {
                res.status(500).send(err);
            });

    },
    logout: async (req, res) => {

        var sess = req.session;

        if (sess.userid === null) {
            res.status(400).send('you are currently not logined');
        }
        else {
            sess.destroy(err => {
                if (err) {
                    res.status(500).send(err);
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
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        }

    },
    projectpost: async (req, res) => {

        const { projectName, member } = req.body;
        var sess = req.session;

        let memberLength = member.length;


        if (!projectName) {
            res.status(422).send('insufficient parameters supplied');
        }
        else {

            project
                .create({
                    projectName: projectName,
                    adminUserId: sess.userid,
                })
                .then(async (project) => {

                    const data = await project.get({ plain: true });
                    let currentEmail;
                    let memberuser;

                    for (let i = 0; i < memberLength; i++) {

                        currentEmail = member[i];
                        memberuser = await user.findOne({ where: { email: currentEmail } });

                        users_projects.create({
                            projectId: data.id,
                            userId: memberuser.id
                        })
                    }
                    res.status(201).json(data);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        }
    },
    todolistpost: async (req, res) => {

        const { body, projectId, userId } = req.body;

        if (!body || !projectId || !userId) {
            res.status(422).send('insufficient parameters supplied');
        }
        else {

            todolist
                .create({
                    body: body,
                    projectId: projectId,
                    userId: userId,
                    IsChecked: false,
                })
                .then(async (todolist) => {
                    const data = await todolist.get({ plain: true });
                    res.status(201).json(data);
                })
                .catch(err => {
                    res.status(404).send(err);
                });
        }
    },
    userchange: async (req, res) => {

        const { email, userName, password } = req.body;
        let sessUserId = req.session.userid;

        let userCurrent = await user.findByPk(sessUserId)

        if (email !== null) {
            userCurrent.email = email;
        }
        if (userName !== null) {
            userCurrent.userName = userName;
        }
        if (password !== null) {
            userCurrent.password = password;
        }

        let result = await userCurrent.save();
        res.status(202).json(result);
    },
    projectchange: async (req, res) => {

        const { id, projectName, adminUserId } = req.body;

        let currentProject = await project.findByPk(id)

        if (projectName !== null) {
            currentProject.projectName = projectName;
        }
        if (adminUserId !== null) {
            currentProject.adminUserId = adminUserId;
        }

        let result = await currentProject.save();
        res.status(202).json(result);

    },
    todolistchange: async (req, res) => {

        const { id, projectId, userId, IsChecked } = req.body;

        let currentTodolist = await todolist.findByPk(id)

        if (projectId !== null) {
            currentTodolist.projectId = projectId;
        }
        if (userId !== null) {
            currentTodolist.userId = userId;
        }
        if (IsChecked !== null) {
            currentTodolist.IsChecked = IsChecked;
        }

        let result = await currentTodolist.save();
        res.status(202).json(result);

    },
    projectdelete: async (req, res) => { // 프로젝트 삭제시 프로젝트와 연관된 todolist도 같이 삭제 되어야 함,

        const { id } = req.body;

        await todolist.destroy({ where: { projectId: id } })  // 연관된 todolist 삭제
        await users_projects.destroy({ where: { projectId: id } })  // 연관된 todolist 삭제

        let currentProject = await project.findOne({ where: { id: id } }) // project 삭제
        await currentProject.destroy();
        res.status(202).json("project deleted");
    },
    todolistdelete: async (req, res) => {  // toddlist는 list 한 개만 삭제 해야 함.

        const { id } = req.body;
        let todolistId = id;

        let currentTodolist = await todolist.findByPk(todolistId)
        await currentTodolist.destroy();
        res.status(202).json("todolist deleted");
    },

}
