import 'reflect-metadata'
import { Ignitor } from '@adonisjs/core'

const ignitor = new Ignitor(new URL('../', import.meta.url), {
  importer: (filePath) => import(filePath),
})

await ignitor.ace().handle(process.argv.slice(2))
