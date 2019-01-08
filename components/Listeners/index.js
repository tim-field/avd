import React, { useEffect, useReducer } from "react"
import api from "../../utils/api"
import { getImage } from "../../utils/user"

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
  const [{ users }, dispatch] = useReducer(reducer, initialState)
  useEffect(
    () => {
      if (trackId) {
        dispatch({ type: "set-loading", value: true })
        api({ action: `avd/users?trackId=${trackId}` }).then(res => {
          console.log(res)
          dispatch({ type: "set-users", users: res })
        })
      }
    },
    [trackId]
  )

  function followUser(userId, followId) {
    api({ action: "/user/follow", data: { userId, followId } })
  }

  return users.length ? (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <button onClick={() => followUser(userId, user.id)}>
            {getImage(user)}
          </button>
        </li>
      ))}
    </ul>
  ) : null
}

export default Listeners
