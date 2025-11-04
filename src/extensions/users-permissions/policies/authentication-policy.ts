const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

// policy de autenticacao customizada para validar login
module.exports = async (ctx, next) => {
  // pega os dados da requisicao de login
  const { identifier, password, role } = ctx.request.body;

  console.log("🛡️ Accessing the policy 🛡️");
  //console.log(ctx.request.body);
  // valida se email e senha foram enviados
  if (!identifier || !password) {
    throw new ApplicationError('Senha ou email inválidos');
  }

  // busca o usuario por email ou username
  const users = await strapi.db.query('plugin::users-permissions.user').findMany({
    where: {
      $or: [{ email: identifier }, { username: identifier }],
      provider: 'local',
    },
    populate: ["role"]
  });

  const user = users[0];
  //console.log(user)
  // verifica se o usuario existe
  if (!user) {
    throw new ApplicationError('Senha ou email inválidos');
  }

  // verifica se o usuario tem senha cadastrada
  if (!user.password) {
    throw new ApplicationError('Senha ou email inválidos');
  }
  //console.log(`role && ${role} !== ${user.role.id}`)
  // verifica se o role enviado corresponde ao role do usuario
  if (role && role !== user.role.id) {
    throw new ApplicationError('Acesso proibido ou inválido');
  }

  // valida se a senha esta correta
  const userService = strapi.plugin('users-permissions').service('user');

  const validPassword = await userService.validatePassword(password, user.password);

  if (!validPassword) {
    throw new ApplicationError('Senha ou email inválidos');
  }

  // verifica se a conta do usuario esta bloqueada
  if (user.blocked) {
    throw new ApplicationError('Sua conta foi bloqueada por um administrador');
  }

  // se configurado remove tokens anteriores para impedir logins simultaneos
  if (process.env.PREVENT_SIMULTANEOUS_LOGINS === 'true') {
    await strapi.db.query('plugin::refresh-token.token').deleteMany({
      where: {
        user: user.id,
      },
    });
  }

  return true;
};
