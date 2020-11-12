'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('todolists', [{
      body: 'todo_body',
      projectId:1,
      userId:1,
      IsChecked: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('todolists', null, {});
  }
};