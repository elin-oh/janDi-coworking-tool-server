'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('user_project', [
      {
        projectId:1,
        userId:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId:2,
        userId:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        projectId:3,
        userId:1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
  ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('user_project', null, {});
  }
};