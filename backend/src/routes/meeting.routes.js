const { verifyJWT } = require('../middleware/auth.middleware')
const prisma = require('../config/database')

module.exports = async (fastify) => {
  fastify.get('/', { onRequest: [verifyJWT] }, async (req, reply) => {
    const meetings = await prisma.meeting.findMany({
      where: { userId: req.user.id },
      orderBy: { scheduledAt: 'asc' },
    })
    reply.send(meetings)
  })

  fastify.post('/', { onRequest: [verifyJWT] }, async (req, reply) => {
    const { title, description, scheduledAt, durationMin, type, meetUrl, location } = req.body
    const meeting = await prisma.meeting.create({
      data: { userId: req.user.id, title, description, scheduledAt: new Date(scheduledAt), durationMin: durationMin || 60, type: type || 'VIDEO', meetUrl, location },
    })
    reply.status(201).send(meeting)
  })

  fastify.patch('/:id', { onRequest: [verifyJWT] }, async (req, reply) => {
    const meeting = await prisma.meeting.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: req.body,
    })
    reply.send(meeting)
  })
}
