require('dotenv').config();
const path = require('path');
const { Sequelize } = require('sequelize');

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();

let sequelize;

if (dialect === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions:
        process.env.DB_SSL === 'true'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
    }
  );
} else {
  // SQLite: Sequelize activa PRAGMA foreign_keys = ON automaticamente
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', process.env.DB_STORAGE || 'forensics.db'),
    logging: false,
  });
}

module.exports = sequelize;
