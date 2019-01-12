import React, { useEffect } from "react"
import api from "../../utils/api"
import { connect } from "../../store"
import UserImage from "../UserImage"

function Following({ following, loadUsers, userId, unFollowUser }) {
  useEffect(
    () => {
      loadUsers(userId)
    },
    [userId]
  )

  function unFollow(followingId) {
    unFollowUser(userId, followingId)
  }

  return (
    <fieldset>
      <legend>Following</legend>
      <ul>
        {following.map(f => (
          <li key={f.id}>
            <UserImage user={f} />
            <button onClick={() => unFollow(f.id)}>x</button>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}

const mapStateToProps = state => ({
  userId: state.userId,
  following: state.following
})

const mapDispatchToProps = dispatch => ({
  async loadUsers(userId) {
    const following = await api({ action: `user/following?userId=${userId}` })
    dispatch({ type: "set-following", following })
  },
  async unFollowUser(userId, followingId) {
    const following = await api({
      action: `user/unfollow`,
      data: { userId, followingId },
      method: "DELETE"
    })
    dispatch({ type: "set-following", following })
  }
})

export default connect({ mapStateToProps, mapDispatchToProps })(Following)
