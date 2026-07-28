export default {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: './data.db',
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['./database/migrations'],
      },
    },
  },
}
