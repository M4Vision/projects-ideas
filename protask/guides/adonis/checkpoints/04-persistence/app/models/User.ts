import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare avatar: string

  toResponse(): any {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar ?? '',
    }
  }
}
