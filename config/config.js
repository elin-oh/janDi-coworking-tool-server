require("dotenv").config();

module.exports = {
  "development": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": "jandi.cq1ribsr3elc.ap-northeast-2.rds.amazonaws.com",
    "dialect": "mysql",
    "timezone": "+09:00"
  },
  "test": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": "jandi.cq1ribsr3elc.ap-northeast-2.rds.amazonaws.com",
    "dialect": "mysql",
    "timezone": "+09:00"
  },
  "production": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": "jandi.cq1ribsr3elc.ap-northeast-2.rds.amazonaws.com",
    "dialect": "mysql",
    "timezone": "+09:00"
  }
}

