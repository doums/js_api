// eslint-disable-next-line @typescript-eslint/no-var-requires
const marv = require('marv/api/promise')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const driver = require('marv-pg-driver')

const options = {
  table: 'db_migrations',
  quiet: true,
  connection: {
    host: 'localhost',
    port: 5432,
    database: 'prisma',
    schema: 'default$default',
    user: 'prisma',
    password: 'prisma'
  }
}

const directory = path.join(process.cwd(), 'migrations')
// eslint-disable-next-line no-unexpected-multiline,@typescript-eslint/explicit-function-return-type
const migrate = async () => {
  const migrations = await marv.scan(directory)
  await marv.migrate(migrations, driver(options))
  console.log('Migration successful')
  process.exit()
}

migrate().then().catch(e => {
  console.log(e)
})
