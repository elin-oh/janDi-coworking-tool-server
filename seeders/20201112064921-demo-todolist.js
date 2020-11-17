'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('todolists', [
      {
        body: 'todo_body1',
        projectId:1,
        userId:1,
        IsChecked: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      // {
      //   body: 'todo_body2',
      //   projectId:1,
      //   userId:1,
      //   IsChecked: false,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   body: 'todo_body3',
      //   projectId:2,
      //   userId:2,
      //   IsChecked: true,
      //   createdAt: "2020-11-15",
      //   updatedAt: "2020-11-15"
      // },
      // {
      //   body: 'todo_body3',
      //   projectId:1,
      //   userId:1,
      //   IsChecked: true,
      //   createdAt: "2020-11-15",
      //   updatedAt: "2020-11-15"
      // }
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('todolists', null, {});
  }
};