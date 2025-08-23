'use strict';

module.exports = (plugin) => {
  // Registrar a policy para o plugin
  plugin.policies = plugin.policies || {};
  plugin.policies['authentication-policy'] = require('./policies/authentication-policy');

  // Buscar rota de login
  const loginRoute = plugin.routes['content-api'].routes.find(
    (route) => route.path === '/auth/local' && route.method === 'POST'
  );

  if (loginRoute) {
    loginRoute.config = loginRoute.config || {};
    loginRoute.config.policies = loginRoute.config.policies || [];
    loginRoute.config.policies.push('plugin::users-permissions.authentication-policy');
  }

  return plugin;
};
