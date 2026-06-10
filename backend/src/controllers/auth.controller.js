const bcrypt  = require('bcryptjs')
const { v4: uuid } = require('uuid')
const prisma  = require('../config/database')

async function login(req, reply) {
  const { email, password } = req.body
  if (!email || !password) return reply.status(400).send({ error: 'E-mail e senha obrigatórios' })

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user || !user.active) return reply.status(401).send({ error: 'Credenciais inválidas' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return reply.status(401).send({ error: 'Credenciais inválidas' })

  const token = reply.server.jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    { expiresIn: '8h' }
  )

  const refreshToken = reply.server.jwt.sign({ id: user.id }, { expiresIn: '30d' })
  const expiresAt    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await prisma.session.create({ data: { userId: user.id, refreshToken, expiresAt } })

  reply
    .setCookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', path: '/' })
    .send({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}

async function me(req, reply) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  reply.send(user)
}

async function logout(req, reply) {
  reply.clearCookie('token').send({ ok: true })
}

module.exports = { login, me, logout }
