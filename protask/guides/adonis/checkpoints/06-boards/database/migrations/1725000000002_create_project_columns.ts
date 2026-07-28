import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'project_columns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title', 200).notNullable()
      table.integer('order_column').notNullable()
      table.integer('board_id').unsigned().references('id').inTable('boards').onDelete('CASCADE')
      table.string('color', 7).nullable()
      table.text('description').nullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
