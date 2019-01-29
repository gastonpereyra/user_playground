const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {
  Query: {
    getUsers: (root,args,{auth,users}) => {
      if (!auth) throw new Error('Debe estar Loggeado.');
        return users.findAll()
                    .catch(err => err);
    },
    getUser: (root, {id}, {auth,users}) => {
      if (!auth) throw new Error("Debe estar Loggeado");
      return users.findOne({where: {id: id}})
                  .catch(err => err)
    },
    getUserByName: (root, {userName}, {auth,users}) => {
      if (!auth) throw new Error("Debe estar Loggeado");
      return users.findOne({where: {userName: userName}})
                  .catch(err => err)
    },
    me: (root, args, {auth, users}) => {
      if (!auth) throw new Error("Debe estar Loggeado");
      return users.findOne({where: {id: auth}})
                  .catch(err => err)
    },
    isUserName: (root, {userName}, { users }) => {
      return users.find({where: {userName: userName}})
                  .then( res => !res? false : true)
                  .catch(err => err)
    },
    isEmail: (root, {email}, { users }) => {
      return users.find({where: {email: email}})
                  .then( res => !res? false : true)
                  .catch(err => err)
    }
  },
  Mutation: {
    logIn: (root, {userName, password}, { auth, users })=> {
      if (auth) throw new Error ("Usted ya esta loggeado.");
      return users.findOne({where: {userName: userName}}).then((user) => {
            const result = bcrypt.compareSync(password, user.password);
            if (!result) throw new Error();
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET)
            return ({
              token,
              "userName": user.userName
            });
        })
        .catch(error =>  new Error("Usuario o Password Incorrectos.") );
    },
    signIn: (root, {input}, { auth, users })=> {
      if (auth) throw new Error ("Usted ya esta loggeado.");

      return users.create(input)
        .then( newUser => {
          const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);
          return ({
              token,
              "userName": newUser.userName
            });
        })
        .catch(err => new Error('No se pudo Crear Usuario, '+err));
    },
    updateUser: (root, {input}, { auth, users })=> {
      if (!auth) throw new Error("Debe estar Loggeado");
      return users.update(input,{where:{ id: auth }})
                  .then(user => users.findOne({where:{id: auth}}))
                  .catch(err => "Error: "+err);
    },
    changeRole: (root, {userId, role}, { auth, users })=> {
      if (!auth) throw new Error("Debe estar Loggeado");
      return users.findOne({where:{id: auth}})
                  .then(user => {
                    if (user.role <2) throw new Error("Debe ser Admin");
                    const newRole = role === 'MOD' ? 1 : 0;
                    return users.update({role: newRole},{where:{ id: userId }})
                      .then( () => users.findOne({where:{id: userId}}))
                  })
                  .catch(err => err);
    },
    deleteUser: (root, {id}, { auth, users })=> {
      if (!auth) throw new Error("Debe estar Loggeado");
      return users.findOne({where:{id: auth}})
                  .then(user => {
                    if (user.role <2) throw new Error("Debe ser Admin")
                    return users.findOne({where:{ id: id }})
                            .then( u => users.destroy({where:{ id: id }})
                                    .then( () => u)
                            );
                  })
                  .catch(err =>  new Error("Error: "+err));
    }
  }
}
