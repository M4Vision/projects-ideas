import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/orm'
import User from './User.js'
import ProjectColumn from './ProjectColumn.js'

export default class Board extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare ownerId: number

  @column()
  declare description: string | null

  @column()
  declare color: string | null

  @column({
    prepare: (v: string[] | null) => v ? JSON.stringify(v) : null,
    consume: (v: string | null) => v ? JSON.parse(v) : [],
  })
  declare categories: string[] | null

  @column({
    prepare: (v: number[] | null) => v ? JSON.stringify(v) : null,
    consume: (v: string | null) => v ? JSON.parse(v) : [],
  })
  declare memberIds: number[]

  @hasMany(() => ProjectColumn)
  declare columns: HasMany<typeof ProjectColumn>

  async getMembers(): Promise<any[]> {
    const ids = [this.ownerId, ...(this.memberIds || [])]
    if (ids.length === 0) return []
    const users = await User.query().whereIn('id', ids)
    return users.map((u) => u.toResponse())
  }
}
