const { query, getRow } = require("../utils/db")
const { reduceConditionValues } = require("../utils/sql")

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

function getAVD(trackId, userId) {
  const sql = `
  select
    coalesce(user_track.arousal, track.arousal)::numeric::integer arousal,
    coalesce(user_track.valence, track.valence)::numeric::integer valence,
    coalesce(user_track.depth, track.depth)::numeric::integer depth,
    user_track.liked
  from 
    track
  left join 
    user_track on track.id = user_track.track_id and user_id = $2 
  where 
    track.id = $1`
  return getRow(sql, [trackId, userId])
}

async function getTracks({
  userId,
  userFilter,
  arousal,
  valence,
  depth,
  filterLiked
}) {
  const avd = { arousal, valence, depth }
  const avdWhere = Object.entries(avd).reduce((conditions, [field, value]) => {
    if (value && value.indexOf(",")) {
      const [min, max] = value
        .split(",")
        .map(Number)
        .map(n => (isNaN(n) ? 0 : n))
      if (min && max && min !== max) {
        return conditions.concat(
          `coalesce(ut.${field}, t.${field}) between ${Math.min(
            min,
            max
          )}::int and ${Math.max(min, max)}::int\n`
        )
      } else if (min || max) {
        return conditions.concat(
          `coalesce(ut.${field}, t.${field}) = ${Math.max(min, max)}::int\n`
        )
      }
    }
    return conditions
  }, [])

  const filterUsers = userFilter ? userFilter.split(",") : []
  const withUserFilter = filterLiked || filterUsers.length > 0

  const [userFilterValues, userFilterConditions] = reduceConditionValues(
    filterUsers,
    position => `user_filter.user_id = $${position}`
  )

  const userFilterCondition =
    userFilterConditions.length > 0
      ? [`( ${userFilterConditions.join(" or ")} )\n`]
      : []

  const userFilterLikedCondition = filterLiked
    ? "user_filter.liked = true" // tracks user has liked
    : "(ut.liked is null or ut.liked = true)" // tracks user hasn't disliked

  const userFilterWhere = userFilterCondition.concat(userFilterLikedCondition)

  const playlistWhere = avdWhere.concat(userFilterWhere)

  if (playlistWhere.length > 0) {
    const values = withUserFilter ? userFilterValues.concat(userId) : [userId]
    const userIdPosition = values.length

    const where = playlistWhere.join(" and ")

    const sql = `
    select
      t.id, 
      ut.user_id,
      ut.liked, 
      coalesce(ut.arousal, t.arousal)::numeric::integer arousal, 
      coalesce(ut.valence, t.valence)::numeric::integer valence, 
      coalesce(ut.depth, t.depth)::numeric::integer depth, 
      t.json->'item'->>'name' as name, 
      t.json->'item'->'artists'->0->>'name' as artist
    from 
      track t 
    ${
      withUserFilter
        ? `join user_track as user_filter on user_filter.track_id = t.id`
        : ""
    }
    left join 
      user_track ut on ut.track_id = t.id and ut.user_id = $${userIdPosition}
    where 
      ${where}
    order by 
      ut.user_id nulls first, random()
    limit 30
    `
    const dbRes = await query(sql, values)
    return dbRes.rows.length ? dbRes.rows : []
  }
  return []
}

module.exports = {
  getListeners,
  getTracks,
  getAVD
}
