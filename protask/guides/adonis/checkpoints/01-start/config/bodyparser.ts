export default {
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
  json: {
    encoding: 'utf-8',
    limit: '1mb',
    strict: true,
    types: ['application/json'],
  },
  form: {
    encoding: 'utf-8',
    limit: '1mb',
    types: ['application/x-www-form-urlencoded'],
  },
  raw: {
    encoding: 'utf-8',
    limit: '1mb',
    types: ['text/plain'],
  },
  multipart: {
    autoProcess: true,
    processManually: [],
  },
}
