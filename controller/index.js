const { user, project, todolist, users_projects, sequelize } = require('../models');

module.exports = {
    userinfo: async (req, res) => {
        if (!req.session.userid) {
            return res.status(401).send('need user session')
        }
        user
            .findOne({
                where: { id: req.session.userid },
                attributes: ['email', 'userName'],
                include: [{
                    model: todolist,
                    attributes: [
                        [sequelize.fn('COUNT', 'id'), 'todoTotalCount'],
                        [sequelize.literal(`SUM(IsChecked)`), 'todoDoneCount']
                    ],
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
        let prId = await user.findOne({
            where:{id:req.session.userid},
            attributes:[],
            include:{
                model:project,
                attributes:['id'],
                through:{attributes:[]}
            }
        })
        let prList = prId.projects.map(ele=>ele.id)
        let result = await Promise.all(
            prList.map(prID =>
                user
                .findOne({
                    where: { id: 1 },
                    attributes: [],
                    include: {
                        model: project,
                        where:{ id: prID },
                        attributes: ['id', 'projectName'],
                        through: { attributes: [] },
                        include: {
                            model: todolist,
                            attributes: ['createdAt', [sequelize.fn('COUNT', 'createdAt'), 'COUNT']],
                            group: ['createdAt'],
                            order: ['createdAt'],
                            separate:true
                        },
                    }
                })     
                .then(reArr=>reArr.projects[0])
                )
        )
        let projectResult = result.map(item => item.dataValues);

            projectResult.forEach(item => {
                item.todolists = item.todolists.reduce((a, c) => {
                    a[c.dataValues.createdAt] = c.dataValues.COUNT;
                    return a;
                }, {})
            })
        res.status(200).send(result)
    },

    projectinfo: async (req, res) => {
        let member = await project.findOne({
            where: { id: req.query.pid },
            attributes: [],
            include: {
                model: user,
                attributes: ['email'],
                through: { attributes: [] }
            }
        })

        let prtodo
        let obj = {}
        let memberEmail = []
        member.users.forEach(ele => memberEmail.push(ele.email))
        obj['member'] = memberEmail

        if (req.query.day) {
            prtodo = await project.findOne({
                where: { id: req.query.pid },
                attributes: ['adminUserId'],
                include: {
                    model: todolist,
                    where: { createdAt: req.query.day },
                    attributes: ['id', 'body', 'IsChecked'],
                    include:{
                        model:user,
                        attributes:['userName']
                    }
                }
            })
        }
        else {
            prtodo = await project.findOne({
                where: { id: req.query.pid },
                attributes: ['adminUserId'],
                include: {
                    model: todolist,
                    attributes: ['id', 'body', 'IsChecked'],
                    include:{
                        model:user,
                        attributes:['userName']
                    }
                }
            })
        }
        if(!prtodo){
            prtodo = await project.findOne({
                where:{id:req.query.pid},
                attributes:['adminUserId']
            })
        }
        obj['project'] = prtodo

        obj.project.adminUserId === req.session.userid
            ? obj.project.adminUserId = true
            : obj.project.adminUserId = false

        res.send(obj)



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
                        userName: result.userName,
                        password: result.password
                    });
                }
            })
            .catch(err => {
                console.log(err)
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
                    res.status(201).json(`id:${data.id}`);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        }

    },
    projectpost: async (req, res) => {

        const { projectName, member } = req.body;
        var sess = req.session;

        if (!projectName) {
            res.status(422).send('insufficient parameters supplied');
        }
        else if (!sess.id) {
            res.status(422).send('you are not login');
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

                    users_projects.create({
                        projectId: data.id,
                        userId: sess.userid
                    })

                    if (member) {

                        for (let i = 0; i < member.length; i++) {

                            currentEmail = member[i];
                            memberuser = await user.findOne({ where: { email: currentEmail } });

                            users_projects.create({
                                projectId: data.id,
                                userId: memberuser.id
                            })
                        }
                    }
                    res.status(201).json(data);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        }
    },
    todolistpost: async (req, res) => {

        const { body, projectId, email } = req.body;
        let currentUserId

        if (!body || !projectId) {
            res.status(422).send('insufficient parameters supplied');
        }
        else {

            if (!email) {

                currentUserId = req.session.userid;
            }
            else {
                await user.findOne({ where: { email: email } })
                    .then((data) => {
                        currentUserId = data.id;
                    })
            }

            todolist
                .create({
                    body: body,
                    projectId: projectId,
                    userId: currentUserId,
                    IsChecked: false,
                })
                .then(async (todolist) => {
                    const data = await todolist.get({ plain: true });
                    res.status(201).json(data);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        }
    },
    userchange: async (req, res) => {

        const { userName, currentPassword, newPassword } = req.body;
        let sessUserId = req.session.userid;
        let result;
        let hasingPassword;

        let userCurrent = await user.findByPk(sessUserId)

        if (userName !== null) {
            userCurrent.userName = userName;
        }
        if (currentPassword == null || newPassword == null) {

            res.status(422).send('insufficient parameters supplied');

        } else {

            var shasum = crypto.createHmac('sha512', 'jandikey');
            shasum.update(currentPassword);
            hasingPassword = shasum.digest('hex');

            if (hasingPassword === userCurrent.password) {

                var shasum = crypto.createHmac('sha512', 'jandikey');
                shasum.update(newPassword);
                hasingPassword = shasum.digest('hex');

                userCurrent.password = hasingPassword;

                result = await userCurrent.save();
                res.status(202).json(`id:${result.id}`);
            }
            else {
                res.status(422).send('password not right');
            }
            // 서버에 저장된 해싱된 비밀번호랑 입력된 비밀번호가 같은 경우
            // 맞으면, 새 패스워드를 데이터 베이스에 저장
        }
    },
    projectchange: async (req, res) => {

        const { id, projectName, member } = req.body;

        let currentProject = await project.findByPk(id)

        if (projectName !== null) {
            currentProject.projectName = projectName;
        }
        if (member !== null) {

            for (let i = 0; i < member.length; i++) {

                currentEmail = member[i];
                memberuser = await user.findOne({ where: { email: currentEmail } });

                users_projects.create({
                    projectId: id,
                    userId: memberuser.id
                })
            }
        }

        let result = await currentProject.save();
        res.status(202).json(result);
    },
    todolistchange: async (req, res) => {

        const { id, IsChecked } = req.body;

        let currentTodolist = await todolist.findByPk(id)

        if (IsChecked !== null) {
            currentTodolist.IsChecked = IsChecked;
        }

        await currentTodolist.save();
        res.status(202).end();
    },
    projectdelete: async (req, res) => { // 프로젝트 삭제시 프로젝트와 연관된 todolist도 같이 삭제 되어야 함,

        const { id } = req.body;

        await todolist.destroy({ where: { projectId: id } })  // 연관된 todolist 삭제
        await users_projects.destroy({ where: { projectId: id } })  // 연관된 todolist 삭제

        let currentProject = await project.findOne({ where: { id: id } }) // project 삭제
        await currentProject.destroy();
        res.status(202).json(`id:${id}`);
    },
    todolistdelete: async (req, res) => {  // toddlist는 list 한 개만 삭제 해야 함.

        const { id } = req.body;
        let todolistId = id;

        let currentTodolist = await todolist.findByPk(todolistId)
        await currentTodolist.destroy();
        res.status(202).json(`id:${id}`);
    },
    usercheck: async (req, res) => {

        const { email } = req.body;
        let memberuser = await user.findOne({ where: { email: email } });
        let userId = memberuser && memberuser.id;
        if (userId) {
            let usercheck = await user.findByPk(userId)
                .catch(err => {
                    res.status(500).send(err);
                });
            res.status(200).json({ isUser: true });
        } else {
            res.status(200).json({ isUser: false });
        }
    },
}
