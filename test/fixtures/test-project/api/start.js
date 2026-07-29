import { serve } from '@hono/node-server'
import app from './server.js'

const port = parseInt(process.env.API_PORT || '3099')
console.log('TodoApp API démarrée sur http://localhost:' + port)
serve({ fetch: app.fetch, port })
