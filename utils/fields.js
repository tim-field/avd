const R = require("ramda")
const { decamelize } = require("humps")

const eachField = R.curry((allFields, fn, data) => {
  const callArgs = allFields.map(([field, options]) => {
    const value = data[field]
    return { value, field, options }
  })

  return callArgs.reduce((results, args, index) => {
    const result = [fn({ ...args, index })]
    return results.concat(result)
  }, [])
})

const eachDataField = R.curry((allFields, fn, data) => {
  const fields = allFields.filter(([f]) => data[f] !== undefined)
  return eachField(fields, fn, data)
})

/**
 * Called by eachField
 * (fn) -> (eachFieldCallParams) -> [field, optionSetter(each)]
 */
const setFieldOption = optionSetter => ({
  value,
  field,
  options = {},
  index
}) => {
  return [field, optionSetter(options, { field, value, index })]
}

const setFieldOptions = (fields, fn) => eachField(fields, setFieldOption(fn))

const setDataFieldOptions = (fields, fn) =>
  eachDataField(fields, setFieldOption(fn))

/**
 * Option setters
 */
const setColumn = (options, { field }) => ({
  ...options,
  column: options.column || decamelize(field)
})

const setParamIndex = (options, { index }) => {
  const p = index + 1
  return {
    ...options,
    paramIndex: options.type ? `$${p}::${options.type}` : `$${p}`
  }
}

const setValue = (options, { value }) => ({ ...options, value })

// const setCondition = options => ({
//   ...options,
//   condition: options.condition || "="
// })

/**
 * Aggregates an array of Option setter functions into a single function
 */
const settersAggregate = setters => (options, ctx) =>
  setters.reduce((opts, fn) => fn(opts, ctx), options)

const optionSetters = settersAggregate([
  setColumn,
  setParamIndex,
  setValue
  // setCondition
])

const setDataFields = (fields, data, setterFncs) => {
  const setters = setterFncs || optionSetters
  return setDataFieldOptions(fields, setters)(data)
}

const setFields = (fields, data = {}, setterFncs) => {
  const setters = setterFncs || optionSetters
  return setFieldOptions(fields, setters)(data)
}

const getCols = fields => fields.map(([, o]) => o.column)

const getQueryParams = fields => fields.map(([, o]) => o.paramIndex)

const getValues = fields => fields.map(([, o]) => o.value)

const isKey = ([f, o]) => f === "id" || o.key

const getKeys = fields => fields.filter(isKey)

const getNonKeys = fields => fields.filter(a => !isKey(a))

const getConditions = (fields, condition = "=") => {
  return fields.map(([, o]) => `${o.column} ${condition} ${o.paramIndex}`)
}

const getField = (name, fields) => fields.find(([field]) => field === name)

module.exports = {
  setFields,
  setDataFields,
  getCols,
  getQueryParams,
  getValues,
  getKeys,
  getNonKeys,
  getConditions,
  getField
}
