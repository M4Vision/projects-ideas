import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'boards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title', 200).notNullable()
      table.integer('owner_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.text('description').nullable()
      table.string('color', 7).nullable()
      table.json('categories').nullable()
      table.json('member_ids').defaultTo('[]')
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
