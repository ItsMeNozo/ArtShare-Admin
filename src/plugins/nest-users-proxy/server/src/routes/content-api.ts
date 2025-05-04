export default [
  {
    method: 'GET',
    path: '/content-manager/collection-types/plugin::users-permissions.user',
    handler: 'proxy.find',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'DELETE',
    path: '/content-manager/collection-types/plugin::users-permissions.user/:id',
    handler: 'proxy.deleteOne',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
] as const;