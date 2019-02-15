import React, { useEffect } from "react"
import api from "../../utils/api"
import { connect } from "../../store"
import UserImage from "../UserImage"
import { filterWithUser } from "../../actions/index"
import "./Following.scss"

function Following({
  dispatch,
  following,
  loadUsers,
  user,
  // unFollowUser,
  userFilter
}) {
  useEffect(() => {
    loadUsers(user)
  }, [user.id])

  // function unFollow(followingId) {
  //   unFollowUser(userId, followingId)
  // }

  return (
    <fieldset className="Following">
      <legend>Following</legend>
      <ul>
        {[user].concat(following).map(f => (
          <li key={f.id}>
            <UserImage user={f} />
            {/* <button onClick={() => unFollow(f.id)}>x</button> */}
            <input
              type="checkbox"
              value={f.id}
              checked={userFilter.includes(f.id)}
              onChange={({ target: { checked } }) => {
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
  user: state.user,
  following: state.following,
  userFilter: state.trackQuery.userFilter
})

const mapDispatchToProps = dispatch => ({
  async loadUsers(user) {
    const following = await api({ action: `user/following?userId=${user.id}` })
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
