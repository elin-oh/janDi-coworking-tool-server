'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('todolists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      body: {
        type: Sequelize.STRING
      },
      projectId: {
        type: Sequelize.INTEGER,
        references: { model: 'projects', key: 'id' }
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }
      },
      IsChecked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATEONLY
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('todolists');
  }
};