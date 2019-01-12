const { query } = require("../utils/db")

async function saveUser(user) {
  const sql = `
    insert into "user" (id, json)
    values ($1, $2)
    on conflict (id)
    do update set
      json = excluded.json
    returning id
  `
  const dbResult = await query(sql, [user.id, user])
  return dbResult.rows[0]
}

async function followUser(userId, followId) {
  const sql = `
    insert into user_follow (user_id, following_id)
    values ($1, $2)
    on conflict (user_id, following_id)
    do nothing
    returning *
  `
  const res = await query(sql, [userId, followId])
  return res.rows[0] || {}
}

async function getFollowing(userId) {
  const sql = `
    select "user".json as "user"
    from user_follow 
    join "user" on "user".id = user_follow.following_id
    where user_follow.user_id = $1
  `
  const dbResult = await query(sql, [userId])
  return dbResult.rows.map(r => r.user)
}

async function unFollow(userId, followingId) {
  const sql = `
    delete from user_follow 
    where user_id = $1 and following_id = $2
  `
  await query(sql, [userId, followingId])
  return getFollowing(userId)
}

module.exports = {
  followUser,
  getFollowing,
  unFollow,
  saveUser
}
