import React, { useEffect, useReducer, useContext } from "react"
import api from "../../utils/api"
import Store from "../../store"
import UserImage from "../UserImage"
import "./Listeners.scss"

function reducer(state, action) {
  switch (action.type) {
    case "set-users":
      return {
        ...state,
        loading: false,
        users: action.users
      }
    case "loading":
      return {
        ...state,
        loading: action.value
      }
    default:
      return state
  }
}

const initialState = { users: [], loading: false }

function Listeners({ trackId, userId }) {
  const { dispatch: appDispatch } = useContext(Store)
  const [{ users }, dispatch] = useReducer(reducer, initialState)
  useEffect(
    () => {
      if (trackId) {
        dispatch({ type: "set-loading", value: true })
        api({ action: `avd/users?trackId=${trackId}` }).then(res => {
          dispatch({ type: "set-users", users: res })
        })
      }
    },
    [trackId]
  )

  function followUser(followId) {
    if (userId !== followId) {
      api({ action: "/user/follow", data: { userId, followId } }).then(
        following => appDispatch({ type: "set-following", following })
      )
    }
  }

  return users.length ? (
    <div className="Listeners">
      <h4>Listeners</h4>
      <ul className="ListenersList">
        {users.map(user => (
          <li key={user.id} className="avatar">
            <button onClick={() => followUser(user.id)}>
              <UserImage user={user} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div className="Listeners">
      <p className="noData">Be the first to rate this track.</p>
    </div>
  )
}

export default Listeners
