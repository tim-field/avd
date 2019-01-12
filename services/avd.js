const { query } = require("../utils/db")

async function getListeners(trackId) {
  const sql = `
    select "user".json as "user"
    from user_track 
    join "user" on "user".id = user_track.user_id
    where user_track.track_id = $1 
    and user_track.arousal is not null
    and user_track.valence is not null
    and user_track.depth is not null
    order by user_track.first_heard_at asc limit 30
  `
  const dbResult = await query(sql, [trackId])
  return dbResult.rows.map(r => r.user)
}

module.exports = {
  getListeners
}
