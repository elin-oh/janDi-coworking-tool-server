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