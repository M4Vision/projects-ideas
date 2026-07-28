export default {
  typescript: true,
  providers: [
    { file: () => import('@adonisjs/core/providers/app_provider') },
    { file: () => import('@adonisjs/lucid/database_provider') },
  ],
  preloads: [
    { file: () => import('./start/routes.js') },
    { file: () => import('./start/kernel.js') },
  ],
  commands: [
    '@adonisjs/core/commands',
    '@adonisjs/lucid/commands',
  ],
  metaFiles: [],
  directories: {
    config: 'config',
    controllers: 'app/controllers',
    middleware: 'app/middleware',
    models: 'app/models',
    migrations: 'database/migrations',
    start: 'start',
  },
}
