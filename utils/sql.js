const R = require("ramda")
const {
  getCols,
  getConditions,
  getKeys,
  getNonKeys,
  getQueryParams,
  getValues,
  setDataFields
} = require("./fields")

const insert = R.curry((table, fields, data) => {
  const dataFields = setDataFields(fields, data)
  return [
    `insert into ${table} (${getCols(dataFields)})
     values (${getQueryParams(dataFields)})
     returning *`,
    getValues(dataFields)
  ]
})

const update = R.curry((table, fields, data) => {
  const dataFields = setDataFields(fields, data)
  const keyFields = getKeys(dataFields)
  const nonKeyFields = getNonKeys(dataFields)
  return [
    `update ${table}
     set ${getConditions(nonKeyFields)}
     where ${getConditions(keyFields).join(" and ")}
     returning *`,
    getValues(dataFields)
  ]
})

const insertUpdate = R.curry((table, fields, data) => {
  const dataFields = setDataFields(fields, data)
  const keyFields = getKeys(dataFields)
  const setConflicts = getNonKeys(dataFields).map(
    ([, o]) => `${o.column} = excluded.${o.column}`
  )

  return [
    `insert into ${table} (${getCols(dataFields)})
     values (${getQueryParams(dataFields)})
     on conflict (${getCols(keyFields)})
     do update
     set ${setConflicts}
     returning *`,
    getValues(dataFields)
  ]
})

const select = R.curry((table, fields, data) => {
  const dataFields = setDataFields(fields, data)
  const where = getConditions(dataFields)
  const whereStmt = where.length > 0 ? ` where ${where.join(" and ")}` : ""
  const sql = `select * from ${table}${whereStmt}`
  const values = getValues(dataFields)
  return [sql, values]
})

const remove = R.curry((table, fields, data) => {
  const dataFields = setDataFields(fields, data)
  const values = getValues(dataFields)
  const sql = `delete from ${table} where ${getConditions(dataFields)}`
  return [sql, values]
})

module.exports = {
  insert,
  update,
  select,
  remove,
  insertUpdate
}
