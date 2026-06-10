const { verifyJWT } = require('../middleware/auth.middleware')
const prisma = require('../config/database')

module.exports = async (fastify) => {
  fastify.get('/', { onRequest: [verifyJWT] }, async (req, reply) => {
    const items = await prisma.complianceItem.findMany({ where: { userId: req.user.id } })
    const score = items.length
      ? Math.round(items.reduce((a, c) => a + (c.score / c.maxScore) * 100, 0) / items.length)
      : 0
    reply.send({ score, items })
  })
}
