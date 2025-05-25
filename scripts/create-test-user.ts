import { generatePasswordHash } from '@src/api/Users/helpers/users.helpers'
import { usersModel } from '@src/api/Users/repository/users.schema'
import { dbStrategy } from '@src/config/db/dbStrategy'
import currentEnv from '@src/config/environments'
import { shortId } from '@src/lib/shortId'

const db = dbStrategy.mongo
console.log('🔗 Conectando a MongoDB...', currentEnv.dataBase.mongo.url)
await db.connect(currentEnv.dataBase.mongo.url)

const email = 'test@example.com'
const exists = await usersModel.findOne({ email })
if (!exists) {
  const passwordHash = await generatePasswordHash('Password.123')
  await usersModel.create({
    _id: shortId.rnd(),
    email,
    name: 'Test User',
    avatar: null,
    authProvider: 'local',
    passwordHash,
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  console.log('✅ Usuario de prueba creado:', email)
} else {
  console.log('ℹ️ Usuario ya existe:', email)
}

await db.disconnect()
process.exit()
