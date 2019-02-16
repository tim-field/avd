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

async function getGraphTracks({ userId, userFilter, series, filterLiked }) {
  console.log(series)
  const seriesCount = series.arousal.length
  const perStep = 15
  const each = Array.from({ length: seriesCount - 1 }).map((_, idx) => idx)
  const steps = each.map(idx => {
    const step = idx + 1
    const arousal = `${series.arousal[idx]}::numeric`
    const arousalEnd = `${series.arousal[idx + 1]}::numeric`
    const valence = `${series.valence[idx]}::numeric`
    const valenceEnd = `${series.valence[idx + 1]}::numeric`
    const depth = `${series.depth[idx]}::numeric`
    const depthEnd = `${series.depth[idx + 1]}::numeric`

    return `step${step}(a, sa, v, sv, d, sd, id, path) as (
      select 
      ${arousal}, -- starting
      (${arousal} - ${arousalEnd}) / (${perStep}-1), -- each step towards next value
      ${valence},
      (${valence} - ${valenceEnd}) / (${perStep}-1),
      ${depth},
      (${depth} - ${depthEnd}) / (${perStep}-1),
      c.id,
      ${
        step === 1
          ? "array[c.id]"
          : `(select step${step - 1}.path from step${step -
              1} order by array_length(step${step - 1}.path,1) desc limit 1)`
      }
      from closest(${arousal}, ${valence}, ${depth}, '${userId}'::text) as c
    union all
      select
      a-sa, sa, v-sv, sv, d-sd, sd, c.id, path || c.id 
      from step${step}, closest(a-sa, v-sv, d-sd, '${userId}'::text, path) as c
      where array_length(path,1) < ${perStep * step}
    )`
  })

  const filterUsers = userFilter ? userFilter.split(",") : []
  const withUserFilter = filterLiked || filterUsers.length > 0

  const userFilterJoin = withUserFilter
    ? `join user_track as user_filter on user_filter.track_id = t.id`
    : ""

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

  const whereConditions = userFilterCondition.concat(userFilterLikedCondition)
  const where = whereConditions.length
    ? `where ${whereConditions.join(" and ")}`
    : ""
  const values = withUserFilter ? userFilterValues.concat(userId) : [userId]

  const userIdPosition = values.length

  const selects = each.map(idx => {
    const step = idx + 1
    return `select
        t.id, 
        ut.liked,
        coalesce(ut.arousal, t.arousal)::numeric::integer arousal, 
        coalesce(ut.valence, t.valence)::numeric::integer valence, 
        coalesce(ut.depth, t.depth)::numeric::integer depth,
        t.json->'item'->>'name' as name, 
        t.json->'item'->'artists'->0->>'name' as artist
      from step${step} 
      join track t on t.id = step${step}.id
      left join user_track ut on ut.track_id = t.id and ut.user_id = $${userIdPosition}
      ${userFilterJoin}
      ${where}
      `
  })
  const sql = `with recursive ${steps.join(",\n")} 
  ${selects.join("\n union all \n")}`

  // console.log(sql)
  // return []

  const dbRes = await query(sql, values)
  return dbRes.rows.length ? dbRes.rows : []
}

async function getTracks({
  userId,
  userFilter,
  arousal,
  valence,
  depth,
  exclude,
  filterLiked
} = {}) {
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

    const excludeTracksConditions = exclude
      ? exclude.split(",").map(trackId => `t.id != '${trackId}'::text`)
      : []

    const where = playlistWhere.concat(excludeTracksConditions).join(" and ")

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
      random()
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
  getGraphTracks,
  getAVD
}
