require("dotenv").config()
const R = require("ramda")
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const request = require("request")
const { query } = require("./utils/db")
const { getConditions, setDataFields, getValues } = require("./utils/fields")

const { HOST, PORT, SPOTIFY_CLIENT_ID, SPOTIFY_SECRET } = process.env
const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get("/authorize", (req, res) => {
  console.log(req.query.code)
  request.post(
    `https://accounts.spotify.com/api/token`,
    {
      form: {
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: `http://localhost:1234/`,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_SECRET
      }
    },
    (err, response, body) => {
      res.status(response.statusCode).json(JSON.parse(body))
    }
  )
})

app.get("/refresh", (req, res) => {
  const { refresh_token } = req.query
  request.post(
    `https://accounts.spotify.com/api/token`,
    {
      form: {
        grant_type: "refresh_token",
        refresh_token,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_SECRET
      }
    },
    (err, response, body) => {
      res.status(response.statusCode).json(JSON.parse(body))
    }
  )
})

app.post("/avd", async (req, res) => {
  const { trackId, userId, arousal, valence, depth } = req.body
  const sql = `
  insert into track (id, user_id, arousal, valence, depth) 
  values ($1, $2, $3, $4, $5)
  on conflict (id, user_id)
  do update set 
    arousal = excluded.arousal,
    valence = excluded.valence,
    depth = excluded.depth,
    play_count = excluded.play_count + 1,
    last_heard_at = current_timestamp
  returning *
  `
  console.log(sql)
  const dbResult = await query(sql, [trackId, userId, arousal, valence, depth])
  return res.status(200).json(dbResult.rows[0])
})

app.post("/avd/like", async (req, res) => {
  const { trackId, userId, liked } = req.body
  const sql = `
  insert into track (id, user_id, liked) 
  values ($1, $2, $3)
  on conflict (id, user_id)
  do update set 
    liked = excluded.liked
  returning *
  `
  console.log(sql)
  const dbResult = await query(sql, [trackId, userId, liked])
  return res.status(200).json(dbResult.rows[0])
})

app.get("/avd", async (req, res) => {
  const { trackId, userId } = req.query
  const sql = `select arousal, valence, depth, liked
  from track where id = $1 and user_id = $2`
  const dbRes = await query(sql, [trackId, userId])
  console.log(dbRes)
  return res.status(200).json(dbRes.rows.length ? dbRes.rows[0] : {})
})

app.post("/track", async (req, res) => {
  const { trackId, userId, track } = req.body
  const sql = `insert into track (id, user_id, "json") 
  values ($1, $2, $3)
  on conflict (id, user_id)
  do update set 
    json = excluded.json`
  const dbRes = await query(sql, [trackId, userId, track])
  console.log(dbRes)
  return res.status(200).json(dbRes.rows.length ? dbRes.rows[0] : {})
})

const trackFields = Object.freeze([
  ["id", { type: "text", key: true }],
  ["userId", { key: true }],
  ["arousal", { type: "int2" }],
  ["valence", { type: "int2" }],
  ["depth", { type: "int2" }]
])

const trackSelect = R.curry((fields, { fuzz = 1, ...data }) => {
  const dataFields = setDataFields(fields, data)
  // const where = getConditions(dataFields, ">=")
  const fuzzValue = Number(fuzz)
  const avd = ["arousal", "valence", "depth"]
  const where = dataFields
    .filter(([f, o]) => avd.includes(f))
    .map(([, o]) => {
      return `( ${o.value} = 0 OR ${o.column} between ${
        o.paramIndex
      } -${fuzzValue} and ${o.paramIndex} +${fuzzValue} )`
    })
  // const whereStmt = where.length > 0 ? ` where ${where.join(" and ")}` : ""
  const whereStmt = where.length > 0 ? ` where ${where.join(" and ")}` : ""
  const sql = `select 
    id, json->'item'->>'name' as name, json->'item'->'artists'->0->>'name' as artist
  from track  ${whereStmt}`
  const values = getValues(dataFields)
  return [sql, values]
})

const trackSelectStatement = trackSelect(trackFields)

app.get("/tracks", async (req, res) => {
  const { id: trackId, ...params } = req.query
  const [sql, values] = trackSelectStatement({ trackId, ...params })
  const dbRes = await query(sql, values)
  return res.status(200).json(dbRes.rows.length ? dbRes.rows : [])
})

// need a get now then we done

app.listen(PORT, () => console.log(`Listening at ${HOST}:${PORT}`))
