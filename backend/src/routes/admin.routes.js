const { verifyAdmin } = require('../middleware/auth.middleware')
const prisma  = require('../config/database')
const bcrypt  = require('bcryptjs')

module.exports = async (fastify) => {

  // ── Dashboard ────────────────────────────────────────────
  fastify.get('/dashboard', { onRequest: [verifyAdmin] }, async (req, reply) => {
    const [clients, docs, meetings] = await Promise.all([
      prisma.user.count({ where: { role: 'CLIENT', active: true } }),
      prisma.document.count(),
      prisma.meeting.count({ where: { status: { in: ['SCHEDULED','CONFIRMED'] }, scheduledAt: { gte: new Date() } } }),
    ])
    reply.send({ clients, documents: docs, upcomingMeetings: meetings })
  })

  // ── Listar clientes ──────────────────────────────────────
  fastify.get('/users', { onRequest: [verifyAdmin] }, async (req, reply) => {
    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true, name: true, email: true, active: true, createdAt: true,
        // Campos extras via JSON no campo "name" não, mas via metadata
        // Por ora retornamos o que temos no schema
      },
      orderBy: { createdAt: 'desc' },
    })
    // Enriquece com dados extras salvos localmente no campo description (workaround)
    reply.send(users)
  })

  // ── Criar cliente ────────────────────────────────────────
  fastify.post('/users', { onRequest: [verifyAdmin] }, async (req, reply) => {
    const { name, email, password, cpfCnpj, telefone, tipo, areaJuridica, endereco, observacoes, portalAccess } = req.body
    if (!name || !email) return reply.status(400).send({ error: 'Nome e e-mail obrigatórios' })

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return reply.status(400).send({ error: 'E-mail já cadastrado' })

    const hash = await bcrypt.hash(password || 'senha2025', 12)
    const user = await prisma.user.create({
      data: {
        name, email: email.toLowerCase(), passwordHash: hash, role: 'CLIENT',
        active: portalAccess !== false,
      }
    })

    // Salva campos extras num registro de auditoria reutilizado
    // (na v2 do schema adicionaremos colunas dedicadas — por ora via AuditLog)
    await prisma.auditLog.create({
      data: {
        userId: user.id, action: 'client_metadata',
        entity: 'user', entityId: user.id,
        details: JSON.stringify({ cpfCnpj, telefone, tipo, areaJuridica, endereco, observacoes, portalAccess }),
        hash: Buffer.from(user.id).toString('hex').substring(0,64),
      }
    })

    reply.status(201).send({ id: user.id, name: user.name, email: user.email, active: user.active })
  })

  // ── Editar cliente ───────────────────────────────────────
  fastify.patch('/users/:id', { onRequest: [verifyAdmin] }, async (req, reply) => {
    const { id } = req.params
    const { name, email, portalAccess, areaJuridica, cpfCnpj, telefone, endereco, observacoes } = req.body

    const data = {}
    if (name)  data.name   = name
    if (email) data.email  = email.toLowerCase()
    if (portalAccess !== undefined) data.active = portalAccess

    await prisma.user.update({ where: { id }, data })

    // Atualiza metadata
    await prisma.auditLog.create({
      data: {
        userId: id, action: 'client_metadata_update',
        entity: 'user', entityId: id,
        details: JSON.stringify({ areaJuridica, cpfCnpj, telefone, endereco, observacoes, portalAccess }),
        hash: Buffer.from(id + Date.now()).toString('hex').substring(0,64),
      }
    })

    reply.send({ ok: true })
  })

  // ── Listar todos documentos ──────────────────────────────
  fastify.get('/documents', { onRequest: [verifyAdmin] }, async (req, reply) => {
    const docs = await prisma.document.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    reply.send(docs)
  })

  // ── Listar reuniões ──────────────────────────────────────
  fastify.get('/meetings', { onRequest: [verifyAdmin] }, async (req, reply) => {
    const meetings = await prisma.meeting.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { scheduledAt: 'asc' },
    })
    reply.send(meetings)
  })

  // ── Criar reunião ────────────────────────────────────────
  fastify.post('/meetings', { onRequest: [verifyAdmin] }, async (req, reply) => {
    const { userId, title, description, scheduledAt, durationMin, type, meetUrl, location } = req.body
    if (!userId || !title || !scheduledAt) return reply.status(400).send({ error: 'userId, title e scheduledAt obrigatórios' })
    const meeting = await prisma.meeting.create({
      data: {
        userId, title, description,
        scheduledAt: new Date(scheduledAt),
        durationMin: durationMin || 60,
        type: type || 'VIDEO',
        meetUrl, location,
        status: 'SCHEDULED',
      }
    })
    reply.status(201).send(meeting)
  })

  // ── Enviar mensagem para cliente ─────────────────────────
  fastify.post('/messages', { onRequest: [verifyAdmin] }, async (req, reply) => {
    const { toId, subject, body } = req.body
    if (!toId || !body) return reply.status(400).send({ error: 'toId e body obrigatórios' })
    const msg = await prisma.message.create({
      data: { fromId: req.user.id, toId, subject, body }
    })
    reply.status(201).send(msg)
  })

}