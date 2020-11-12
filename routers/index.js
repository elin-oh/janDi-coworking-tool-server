const express = require('express');
const router = express.Router();
const Controller = require('../controller');

router.get('/userinfo', Controller.userinfo)
router.get('/projectinfo', Controller.projectinfo)
router.get('/todolistinfo', Controller.todolistinfo)
router.get('/user_project', Controller.user_project)
router.post('/login', Controller.login)
router.post('/logout', Controller.logout)
router.post('/userpost', Controller.userpost)
router.post('/projectpost', Controller.projectpost)
router.post('/todolistpost', Controller.todolistpost)
router.put('/userchange', Controller.userchange)
router.put('/projectchange', Controller.projectchange)
router.put('/todolistchange', Controller.todolistchange)
router.delete('/projectdelete', Controller.projectdelete)
router.delete('/todolistdelete', Controller.todolistdelete)

module.exports = router;