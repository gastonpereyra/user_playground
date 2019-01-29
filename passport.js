const passport = require('passport');
const passportJWT = require('passport-jwt');

const { Strategy, ExtractJwt } = passportJWT;
const params = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

module.exports = (app, route, users) => {
  // Configuramos la estrategia
  const strategy = new Strategy(params, (payload, done) => { 
    // Si el Usuario Existe agregamos el ID en el request
    return users.findOne({where: {id: payload.id}}).then(u => {
      return done(null, u.id);
    }).catch(err => done(err));
  });
  // Agregamos la Estrategia
  passport.use(strategy);
  passport.initialize();
  // Nuestro unico Endpoint
  app.use(routes, (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (user) { req.user = user }
      next()
    })(req, res, next)
  });
};
