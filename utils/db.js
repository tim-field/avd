const url = require("url")
const { Pool } = require("pg")

const { DB_STRING } = process.env

if (!DB_STRING) {
  throw new Error("DB_STRING environment variable not found")
}

const getPGConfig = connectionString => {
  const params = url.parse(connectionString)
  const auth = params.auth.split(":")

  return {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split("/")[1]
    // ssl: true
  }
}

const pool = new Pool(getPGConfig(DB_STRING))

const query = (text, values) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(text, values)
  }
  return pool.query(text, values)
}

const getRow = async (text, values) => {
  const { rows } = await query(text, values)
  return rows[0]
}

module.exports = { query, getRow }
