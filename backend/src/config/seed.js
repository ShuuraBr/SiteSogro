require('dotenv').config({ path: '../../.env' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Executando seed...')

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ccarvalho.adv.br'
  const adminPwd   = process.env.ADMIN_PASSWORD || 'admin2025'
  const adminName  = process.env.ADMIN_NAME || 'Dr. Cleydson Carvalho'

  // Admin
  const adminHash = await bcrypt.hash(adminPwd, 12)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: adminName, email: adminEmail, passwordHash: adminHash, role: 'ADMIN' },
  })
  console.log(`✅ Admin: ${admin.email}`)

  // Cliente demo
  const clientHash = await bcrypt.hash('demo2025', 12)
  const client = await prisma.user.upsert({
    where: { email: 'cliente@demo.com' },
    update: {},
    create: { name: 'Cliente Demonstração', email: 'cliente@demo.com', passwordHash: clientHash, role: 'CLIENT' },
  })
  console.log(`✅ Cliente demo: ${client.email}`)

  // Compliance items demo
  const items = [
    { category: 'LGPD', title: 'Mapeamento de dados pessoais', score: 95, maxScore: 100 },
    { category: 'CFM', title: 'Resolução CFM 2227/2018', score: 82, maxScore: 100 },
    { category: 'Telemedicina', title: 'CFM 2.314/2022 — Telemedicina', score: 78, maxScore: 100 },
    { category: 'Contratos', title: 'Contratos de prestação de serviços', score: 90, maxScore: 100 },
    { category: 'Prontuário', title: 'Prontuário eletrônico — CFM', score: 71, maxScore: 100 },
  ]
  for (const item of items) {
    await prisma.complianceItem.create({ data: { userId: client.id, ...item, status: 'active' } })
  }
  console.log('✅ Compliance items criados')

  // Reuniões demo
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 6)
  await prisma.meeting.create({
    data: {
      userId: client.id, title: 'Consulta Estratégica — LGPD',
      scheduledAt: tomorrow, durationMin: 60, type: 'VIDEO', status: 'CONFIRMED',
      meetUrl: 'https://meet.google.com/xxx-yyyy-zzz',
    },
  })
  console.log('✅ Reunião demo criada')

  console.log('\n🎉 Seed concluído!')
  console.log(`   Admin:   ${adminEmail} / ${adminPwd}`)
  console.log('   Cliente: cliente@demo.com / demo2025')
}

main().catch(console.error).finally(() => prisma.$disconnect())
