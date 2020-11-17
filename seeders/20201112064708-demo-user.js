'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [
      {
        email: '123@gmail.com',
        userName: 'Doe',
        password: 'f887af788e4eee98cda0e0d45ba2c1c2b9ae5d34b835bdfdc213698d326aea46acb93a1da679f57b0d914bd2a6efb9cc10433baa6a732b797b9876c805645d19',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};