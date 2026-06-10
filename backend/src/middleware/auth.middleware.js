const prisma = require('../config/database')

async function verifyJWT(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ error: 'Token inválido ou expirado' })
  }
}

async function verifyAdmin(request, reply) {
  await verifyJWT(request, reply)
  if (request.user?.role !== 'ADMIN') {
    return reply.status(403).send({ error: 'Acesso restrito a administradores' })
  }
}

module.exports = { verifyJWT, verifyAdmin }
