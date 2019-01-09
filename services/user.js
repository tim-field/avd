const { query } = require("../utils/db")

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
  return dbResult.rows
}

module.exports = {
  followUser,
  getFollowing
}
