import React, { useEffect } from "react"
import api from "../../utils/api"
import { connect } from "../../store"
import UserImage from "../UserImage"
import { filterWithUser } from "../../actions/index"

function Following({
  dispatch,
  following,
  loadUsers,
  userId,
  // unFollowUser,
  userFilter
}) {
  useEffect(
    () => {
      loadUsers(userId)
    },
    [userId]
  )

  // function unFollow(followingId) {
  //   unFollowUser(userId, followingId)
  // }

  return (
    <fieldset>
      <legend>Following</legend>
      <ul>
        {following.map(f => (
          <li key={f.id}>
            <UserImage user={f} />
            {/* <button onClick={() => unFollow(f.id)}>x</button> */}
            <input
              type="checkbox"
              value={f.id}
              checked={userFilter.includes(f.id)}
              onChange={({ target: { checked } }) => {
                console.log("clicked!")
                dispatch(filterWithUser(f.id, checked))
              }}
            />
          </li>
        ))}
      </ul>
    </fieldset>
  )
}

const mapStateToProps = state => ({
  userId: state.userId,
  following: state.following,
  userFilter: state.trackQuery.userFilter
})

const mapDispatchToProps = dispatch => ({
  async loadUsers(userId) {
    const following = await api({ action: `user/following?userId=${userId}` })
    dispatch({ type: "set-following", following })
  }
  // async unFollowUser(userId, followingId) {
  //   const following = await api({
  //     action: `user/unfollow`,
  //     data: { userId, followingId },
  //     method: "DELETE"
  //   })
  //   dispatch({ type: "set-following", following })
  // }
})

export default connect({ mapStateToProps, mapDispatchToProps })(Following)
