import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/orm'
import User from './User.js'
import Card from './Card.js'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare text: string

  @column()
  declare authorId: number

  @column()
  declare cardId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'authorId' })
  declare author: BelongsTo<typeof User>

  @belongsTo(() => Card, { foreignKey: 'cardId' })
  declare card: BelongsTo<typeof Card>
}
