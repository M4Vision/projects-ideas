import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title', 200).notNullable()
      table.text('description').nullable()
      table.integer('order_column').notNullable()
      table.integer('column_id').unsigned().references('id').inTable('project_columns').onDelete('CASCADE')
      table.date('due_date').nullable()
      table.integer('assignee_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.json('label_ids').defaultTo('[]')
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
