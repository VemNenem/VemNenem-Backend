'use strict';

// extensao do plugin users-permissions para adicionar policy customizada
module.exports = (plugin) => {
  // registra a policy de autenticacao customizada
  plugin.policies = plugin.policies || {};
  plugin.policies['authentication-policy'] = require('./policies/authentication-policy');

  // busca a rota de login do strapi
  const loginRoute = plugin.routes['content-api'].routes.find(
    (route) => route.path === '/auth/local' && route.method === 'POST'
  );

  // adiciona a policy customizada na rota de login
  if (loginRoute) {
    loginRoute.config = loginRoute.config || {};
    loginRoute.config.policies = loginRoute.config.policies || [];
    loginRoute.config.policies.push('plugin::users-permissions.authentication-policy');
  }

  return plugin;
};
