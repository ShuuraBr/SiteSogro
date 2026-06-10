const { login, me, logout } = require('../controllers/auth.controller')
const { verifyJWT } = require('../middleware/auth.middleware')

module.exports = async (fastify) => {
  fastify.post('/login',  login)
  fastify.get('/me',      { onRequest: [verifyJWT] }, me)
  fastify.post('/logout', { onRequest: [verifyJWT] }, logout)
}
