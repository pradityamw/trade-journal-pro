const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Buat user demo
  const email = 'demo@tradejournalpro.com'
  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    const password = await bcryptjs.hash('password123', 12)
    user = await prisma.user.create({
      data: {
        name: 'Demo Trader',
        email,
        password,
        settings: {
          create: {
            monthlyTarget: 10000,
            riskPreference: 1.5,
            currency: 'USD',
            theme: 'dark'
          }
        }
      }
    })
    console.log('Demo user created')
  } else {
    // Delete existing trades for clean seed
    await prisma.trade.deleteMany({ where: { userId: user.id } })
    console.log('Existing demo trades deleted')
  }

  // Helper untuk generate random trades logis
  const pairs = ['XAUUSD', 'EURUSD', 'GBPUSD', 'US30', 'NAS100']
  const sessions = ['LONDON', 'NEW_YORK', 'TOKYO', 'SYDNEY', 'OVERLAP']
  const emotions = ['CALM', 'FEAR', 'GREED', 'REVENGE', 'CONFIDENT', 'FOMO']

  const trades = []
  let currentDate = new Date()
  currentDate.setMonth(currentDate.getMonth() - 3) // Start 3 months ago

  for (let i = 0; i < 50; i++) {
    // Tambah 1-3 hari
    currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 3) + 1)
    
    // Logic agar demo account menguntungkan tapi realistis (60% winrate)
    const isWin = Math.random() < 0.6
    const isBE = !isWin && Math.random() < 0.2
    
    const status = isWin ? 'WIN' : isBE ? 'BREAKEVEN' : 'LOSS'
    const direction = Math.random() > 0.5 ? 'BUY' : 'SELL'
    const pair = pairs[Math.floor(Math.random() * pairs.length)]
    
    // Bias emotion based on result
    let emotion = 'CALM'
    if (isWin) {
       emotion = Math.random() > 0.3 ? 'CALM' : 'CONFIDENT'
    } else {
       emotion = emotions[Math.floor(Math.random() * emotions.length)]
    }

    const rrRatio = isWin ? (1.5 + Math.random() * 2) : (Math.random() > 0.5 ? 1 : 0.5)
    let profitLoss = 0
    
    if (isWin) {
      profitLoss = 50 + Math.random() * 450 // $50 - $500
    } else if (isBE) {
      profitLoss = (Math.random() * 10) - 5 // -$5 to $5
    } else {
      profitLoss = -(30 + Math.random() * 200) // -$30 to -$230
    }

    trades.push({
      userId: user.id,
      pair,
      direction,
      entryPrice: pair.includes('JPY') ? 145 + Math.random() * 5 : 1.05 + Math.random() * 0.1,
      stopLoss: pair.includes('JPY') ? 144 : 1.04,
      takeProfit: pair.includes('JPY') ? 146 : 1.06,
      lotSize: parseFloat((0.1 + Math.random() * 0.9).toFixed(2)),
      riskPercent: 1.0,
      profitLoss: parseFloat(profitLoss.toFixed(2)),
      rrRatio: parseFloat(rrRatio.toFixed(2)),
      session: sessions[Math.floor(Math.random() * sessions.length)],
      emotion: emotion,
      status,
      tradeDate: new Date(currentDate),
      notes: `Trade otomatis dari seed generator. Analisa teknikal menunjukkan setup yang valid.`
    })
  }

  await prisma.trade.createMany({ data: trades })
  console.log(`Successfully inserted ${trades.length} demo trades`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
