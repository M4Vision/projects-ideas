import { HttpContext } from '@adonisjs/core/http'
import Database from '@adonisjs/lucid/services/db'
import Seed from '../../database/seeders/seed.js'

export default class ResetController {
  async reset(ctx: HttpContext) {
    const db = Database.connection()

    await db.rawQuery('PRAGMA foreign_keys = OFF')
    await db.from('comments').del()
    await db.from('cards').del()
    await db.from('labels').del()
    await db.from('invitations').del()
    await db.from('project_columns').del()
    await db.from('boards').del()
    await db.from('users').del()
    await db.rawQuery('PRAGMA foreign_keys = ON')
    await db.rawQuery("DELETE FROM sqlite_sequence")

    const seeder = new Seed()
    await seeder.run()

    return ctx.response.status(200).json({ success: true })
  }
}
