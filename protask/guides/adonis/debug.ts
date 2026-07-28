import { Ignitor } from '@adonisjs/core'

const ignitor = new Ignitor(new URL('./', import.meta.url), {
  importer: (f) => import(f),
})

const app = ignitor.createApp('web')

await app.init()
console.log('Init OK, rcFile:', JSON.stringify(app.rcFile?.directories))
console.log('Config exists:', !!app.config)

if (app.config) {
  console.log('Logger:', JSON.stringify(app.config.get('logger')))
}

try {
  await app.boot()
  console.log('Boot OK')
} catch (e: any) {
  console.error('Boot Error:', e.message)
}
