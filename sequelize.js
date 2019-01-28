const Sequelize = require('sequelize');
const userModel = require('./models/users');
// Crear la Base de Datos
const db= new Sequelize(process.env.DB_URL);
// Agregamos el modelo del Usuario
const User = userModel(db);
// Sincronizamos para que agregue las tables si hace falta
db.sync()
  .then(() => {
    console.log('Todas las Tablas Creadas!');
  })
  .catch( error => {
    console.log('Error: '+error);
});
// Exportamos
module.exports = User;