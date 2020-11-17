'use strict';

const crypto = require('crypto');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user.init({
    email: DataTypes.STRING,
    userName: DataTypes.STRING,
    password: DataTypes.STRING
  }, 
  {
    hooks: {
      beforeCreate: (data, option) => {
        var shasum = crypto.createHmac('sha512', 'jandikey');
        shasum.update(data.password);
        data.password = shasum.digest('hex');
      },
      beforeFind: (data, option) => {
        console.log('data.where.password :'+data.where.password)
        if (data.where.password) {
          var shasum = crypto.createHmac('sha512', 'jandikey');
          shasum.update(data.where.password);
          data.where.password = shasum.digest('hex');        
        }
      }
    },
    sequelize,
    modelName: 'user',
  })
  return user;
};
