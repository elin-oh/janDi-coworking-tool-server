const { user, project, todolist, users_projects } = require('../models');

module.exports = {
    userinfo: async (req, res) => {
        if (!req.session.userid) {
            res.status(401).send('need user session')  //유저세션필요
        }
        else {
            user
                .findOne({
                    where: {
                        id: req.session.userid
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
                    id: req.session.projectid
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
                    id: req.session.todolistid
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
                    id: req.session.todolistid
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

        const { projectName, adminUserId } = req.body;

        if (!projectName || !adminUserId) {
            res.status(422).send('insufficient parameters supplied');
        }
        else {

            project
                .create({
                    projectName: projectName,
                    adminUserId: adminUserId,
                })
                .then(async (project) => {
                    const data = await project.get({ plain: true });
                    res.status(201).json(data);
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
                });
        }
    },
    userchange: async (req, res) => {

        const { email, userName, password } = req.body;
        let sessUserId = req.session.userid;

        let userCurrent = await user.findByPk(1)

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

        console.log(req.body)

        if (JSONparse(id) === 1) {

            console.log("!!!!!!!!!!!!!!!!!!");
        }

        let currentTodolist = await todolist.findByPk(1)

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

        await todolist.findAll({ where: { projectId: id } })
            .then((data) => {
                data.destroy();
            })

        await project.findOne({ where: { id: id } })
            .then((data) => {
                data.destroy();
                res.status(202).json("project deleted");
            })

    },
    todolistdelete: async (req, res) => {  // toddlist는 list 한 개만 삭제 해야 함.

        const { id } = req.body;
        let todolistId = id;

        let currentTodolist = await todolist.findByPk(1)
        await currentTodolist.destroy();
        res.status(202).json("todolist deleted");
    },

}
