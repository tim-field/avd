require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const request = require("request")
const { query } = require("./utils/db")
const {
  saveUser,
  followUser,
  getFollowing,
  unFollow
} = require("./services/user")
const { getListeners, getTracks, getAVD } = require("./services/avd")

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

app.post("/user", async (req, res) => {
  const { user } = req.body
  const savedUser = await saveUser(user)
  return res.status(200).json(savedUser)
})

app.post("/user/follow", async (req, res) => {
  const { userId, followId } = req.body
  await followUser(userId, followId)
  const following = await getFollowing(userId)
  return res.status(200).json(following)
})

app.get("/user/following", async (req, res) => {
  const { userId } = req.query
  const following = await getFollowing(userId)
  return res.status(200).json(following)
})

app.delete("/user/unfollow", async (req, res) => {
  const { userId, followingId } = req.body
  const following = await unFollow(userId, followingId)
  return res.status(200).json(following)
})

app.get("/avd/users", async (req, res) => {
  const { trackId } = req.query
  const users = await getListeners(trackId)
  return res.status(200).json(users)
})

app.post("/avd", async (req, res) => {
  const { trackId, userId, arousal, valence, depth } = req.body

  const sql = `
  insert into user_track (track_id, user_id, arousal, valence, depth) 
  values ($1, $2, $3, $4, $5)
  on conflict (track_id, user_id)
  do update set 
    arousal = excluded.arousal,
    valence = excluded.valence,
    depth = excluded.depth,
    play_count = excluded.play_count + 1,
    last_heard_at = current_timestamp
  returning *
  `
  const dbResult = await query(sql, [trackId, userId, arousal, valence, depth])

  const avd = ["arousal", "valence", "depth"]
  const avdSQL = avd.reduce(
    (a, field) => {
      const value = req.body[field]
      if (value) {
        return {
          names: a.names.concat(field),
          values: a.values.concat(value),
          places: a.places.concat(`$${a.values.length + 1}`),
          conflicts: a.conflicts.concat(
            `${field} = (
                select coalesce( 
                    ( sum(${field}) + excluded.${field} ) / ( count(${field}) + 1 ), 
                    excluded.${field}
                )
                from user_track where track_id = $1 and user_id != $2)`
          )
        }
      }
      return a
    },
    { names: [], values: [trackId, userId], places: [], conflicts: [] }
  )

  if (avdSQL.names.length > 0) {
    const trackSQL = `
      insert into track (id, ${avdSQL.names.join(", ")}) 
      values ($1, ${avdSQL.places.join(", ")})
      on conflict (id)
      do update set
      ${avdSQL.conflicts.join(",\n")}
    `
    query(trackSQL, avdSQL.values)
  }

  return res.status(200).json(dbResult.rows[0])
})

app.post("/avd/like", async (req, res) => {
  const { trackId, userId, liked } = req.body
  const sql = `
  insert into user_track (track_id, user_id, liked) 
  values ($1, $2, $3)
  on conflict (track_id, user_id)
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
  const avd = await getAVD(trackId, userId)
  return res.status(200).json(avd || {})
})

app.post("/track", async (req, res) => {
  const { trackId, track } = req.body
  const sql = `insert into track (id, "json") 
  values ($1, $2)
  on conflict (id)
  do update set 
    json = excluded.json`
  const dbRes = await query(sql, [trackId, track])
  return res.status(200).json(dbRes.rows.length ? dbRes.rows[0] : {})
})

app.get("/tracks", async (req, res) => {
  const tracks = await getTracks(req.query)
  return res.status(200).json(tracks)
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
