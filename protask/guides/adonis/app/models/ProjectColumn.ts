import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/orm'
import Board from './Board.js'
import Card from './Card.js'

export default class ProjectColumn extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare orderColumn: number

  @column()
  declare boardId: number

  @column()
  declare color: string | null

  @column()
  declare description: string | null

  @belongsTo(() => Board)
  declare board: BelongsTo<typeof Board>

  @hasMany(() => Card)
  declare cards: HasMany<typeof Card>
}
