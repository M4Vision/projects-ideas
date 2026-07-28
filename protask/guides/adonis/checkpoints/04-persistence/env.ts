import Env from '@adonisjs/core/env'

export default Env.rules({
  PORT: Env.schema.number.optional(),
  HOST: Env.schema.string.optional(),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
})
