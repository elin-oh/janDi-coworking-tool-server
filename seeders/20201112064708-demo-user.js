'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [
      {
        email: '123@gmail.com',
        userName: 'Doe',
        password: 'pass1234',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: '456@gmail.com',
        userName: 'Joe',
        password: 'anotherpass',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};