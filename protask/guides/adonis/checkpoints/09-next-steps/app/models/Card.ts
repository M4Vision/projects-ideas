import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/orm'
import User from './User.js'
import ProjectColumn from './ProjectColumn.js'
import Comment from './Comment.js'
import Label from './Label.js'

export default class Card extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare orderColumn: number

  @column()
  declare columnId: number

  @column.date()
  declare dueDate: string | null

  @column()
  declare assigneeId: number | null

  @column({
    prepare: (v: number[]) => v ? JSON.stringify(v) : '[]',
    consume: (v: string) => v ? JSON.parse(v) : [],
  })
  declare labelIds: number[]

  @belongsTo(() => User, { foreignKey: 'assigneeId' })
  declare assignee: BelongsTo<typeof User>

  @belongsTo(() => ProjectColumn, { foreignKey: 'columnId' })
  declare column: BelongsTo<typeof ProjectColumn>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  async getLabels(): Promise<any[]> {
    if (!this.labelIds || this.labelIds.length === 0) return []
    return Label.query().whereIn('id', this.labelIds)
  }
}
