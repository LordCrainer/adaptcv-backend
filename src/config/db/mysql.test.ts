import { describe, expect, test } from 'vitest'

import mysqlConnection from './mysql'

describe('mysqlConnection', () => {
  test('should connect to MySQL and return a connection object', async () => {
    const config = {
      host: 'db.dev.lanubetv.net',
      user: 'sed_user2',
      password: 's3dbd2020',
      database: 'SED'
    }

    const mysql = await mysqlConnection(config)
    const [rows] = await mysql.execute('SELECT * FROM Entradas')
    expect((rows as any[]).length).toBe(9907)
    expect(mysql).toBeDefined()
    expect(mysql).toHaveProperty('query')
    expect(mysql).toHaveProperty('execute')
  })
})
