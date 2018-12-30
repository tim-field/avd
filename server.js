require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const request = require("request")
const { query } = require("./utils/db")

const { PORT, URL, SPOTIFY_CLIENT_ID, SPOTIFY_SECRET } = process.env
const app = express()
app.use(cors({ origin: ["https://www.mohiohio.com", "http://localhost:1234"] }))
app.use(bodyParser.json())

app.get("/authorize", (req, res) => {
  console.log(req.query.code)
  request.post(
    `https://accounts.spotify.com/api/token`,
    {
      form: {
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: URL,
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
  const sql = `select 
    arousal,
    valence,
    depth,
    liked,
    avg_arousal::numeric::integer,
    avg_valence::numeric::integer,
    avg_depth::numeric::integer
  from 
  (
    select 
      user_id,
      liked,
	    arousal,
      avg(arousal) filter(where arousal > 0) over w as avg_arousal,
      valence,
      avg(valence) filter(where valence > 0) over w as avg_valence,
      depth,
      avg(depth) filter(where depth > 0) over w as avg_depth
    from track 
    where id = $1
    window w as (partition by id)
  ) as avd 
  where avd.user_id = $2`
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
  return res.status(200).json(dbRes.rows.length ? dbRes.rows[0] : {})
})

const trackSelect = data => {
  const avd = ["arousal", "valence", "depth"]
  const where = avd.reduce(
    (conditions, field) => {
      if (data[field] && data[field].indexOf(",")) {
        const [min, max] = data[field]
          .split(",")
          .map(Number)
          .map(n => (isNaN(n) ? 0 : n))
        if (min && max && min !== max) {
          return conditions.concat(
            `${field} between ${Math.min(min, max)}::int and ${Math.max(
              min,
              max
            )}::int`
          )
        } else if (min || max) {
          return conditions.concat(`${field} = ${Math.max(min, max)}::int`)
        }
      }
      return conditions
    },
    ["(liked is null or liked = true)"]
  )

  if (where.length > 0) {
    const whereStmt = where.length > 0 ? ` where ${where.join(" and ")}` : ""
    const sql = `select
      id, 
      arousal,
      valence,
      depth,
      json->'item'->>'name' as name, 
      json->'item'->'artists'->0->>'name' as artist
    from track ${whereStmt} order by random() limit 30`
    return sql
  }
}

app.get("/tracks", async (req, res) => {
  const sql = trackSelect(req.query)
  if (sql) {
    const dbRes = await query(sql)
    return res.status(200).json(dbRes.rows.length ? dbRes.rows : [])
  }
  return res.status(200).json([])
})

app.get("/playlists", async (req, res) => {
  const sql = `select id, name from playlist where user_id = $1`
  const dbRes = await query(sql, [req.query.userId])
  return res.status(200).json(dbRes.rows.length ? dbRes.rows : [])
})

app.get("/playlist", async (req, res) => {
  const sql = `select * from playlist where id = $1`
  const dbRes = await query(sql, [req.query.id])
  return res.status(200).json(dbRes.rows.length ? dbRes.rows[0] : {})
})

app.post("/playlist", async (req, res) => {
  const { id, userId, name, arousal, valence, depth, playlist } = req.body
  console.log(arousal)
  const sql = `insert into playlist (
    id, 
    user_id, 
    name, 
    arousal,
    valence,
    depth,
    "json"
  ) 
  values ($1, $2, $3, $4, $5, $6, $7)
  on conflict (id, user_id)
  do update set 
    arousal = excluded.arousal,
    valence = excluded.valence,
    depth = excluded.depth,
    name = excluded.name,
    json = excluded.json`
  const dbRes = await query(sql, [
    id,
    userId,
    name,
    arousal,
    valence,
    depth,
    playlist
  ])
  return res.status(200).json(dbRes.rows.length ? dbRes.rows[0] : {})
})

app.listen(PORT, () => console.log(`Listening at ${PORT}`))
