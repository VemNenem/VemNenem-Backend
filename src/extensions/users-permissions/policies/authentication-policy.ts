const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

module.exports = async (ctx, next) => {
  const { identifier, password, role } = ctx.request.body;

  console.log("🛡️ Accessing the policy 🛡️");
  //console.log(ctx.request.body);
  if (!identifier || !password) {
    throw new ApplicationError('Senha ou email inválidos');
  }

  const users = await strapi.db.query('plugin::users-permissions.user').findMany({
    where: {
      $or: [{ email: identifier }, { username: identifier }],
      provider: 'local',
    },
    populate: ["role"]
  });

  const user = users[0];
  //console.log(user)
  if (!user) {
    throw new ApplicationError('Senha ou email inválidos');
  }

  if (!user.password) {
    throw new ApplicationError('Senha ou email inválidos');
  }
  //console.log(`role && ${role} !== ${user.role.id}`)
  if (role && role !== user.role.id) {
    throw new ApplicationError('Acesso proibido ou inválido');
  }

  const userService = strapi.plugin('users-permissions').service('user');

  const validPassword = await userService.validatePassword(password, user.password);

  if (!validPassword) {
    throw new ApplicationError('Senha ou email inválidos');
  }

  if (user.blocked) {
    throw new ApplicationError('Sua conta foi bloqueada por um administrador');
  }

  if (process.env.PREVENT_SIMULTANEOUS_LOGINS === 'true') {
    await strapi.db.query('plugin::refresh-token.token').deleteMany({
      where: {
        user: user.id,
      },
    });
  }

  return true;
};
