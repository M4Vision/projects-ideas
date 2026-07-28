import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/orm'
import Board from './Board.js'

export default class Label extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare color: string

  @column()
  declare description: string | null

  @column()
  declare boardId: number

  @belongsTo(() => Board)
  declare board: BelongsTo<typeof Board>
}
