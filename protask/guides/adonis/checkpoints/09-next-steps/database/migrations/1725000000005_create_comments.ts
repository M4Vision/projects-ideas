import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.text('text').notNullable()
      table.integer('author_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('card_id').unsigned().references('id').inTable('cards').onDelete('CASCADE')
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
