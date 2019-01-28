// Usuarios
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
// Modelo para Los Usuarios
const model = {
  userName: { type: Sequelize.STRING, unique: true, allowNull: false },
  email: { type: Sequelize.STRING, unique: true, allowNull: false, validate: { isEmail: true } },
  role: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0, max: 2 } },
  password: { type: Sequelize.INTEGER, allowNull: false, validate: { len: [4,16] } }
};
// Hooks
const hooks = {
  hooks: {
    afterValidate: (user) => {
      user.password= bcrypt.hashSync(user.password, parseInt(process.env.CRYPT_SECRET));
    }
  }
};
// Exportar
module.exports = (db) => {
  return db.define('users', model, hooks);
};