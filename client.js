import React, { useEffect, Fragment, useReducer } from "react"
import ReactDOM from "react-dom"
import { library } from "@fortawesome/fontawesome-svg-core"
import {
  faThumbsUp,
  faThumbsDown,
  faPause,
  faPlay,
  faStepBackward,
  faStepForward
} from "@fortawesome/free-solid-svg-icons"
import request, { fetchToken, AUTH_URL } from "./utils/spotify"
import CurrentTrack from "./components/CurrentTrack"
import PlayList from "./components/PlayList"
import Loading from "./components/Loading"

library.add(
  faThumbsUp,
  faThumbsDown,
  faPause,
  faPlay,
  faStepBackward,
  faStepForward
)

const initialState = {
  arousal: 0,
  valence: 0,
  depth: 0,
  loading: false,
  token: localStorage.getItem("access_token"),
  userId: localStorage.getItem("userId")
}

function reducer(state, action) {
  switch (action.type) {
    case "set-avd": {
      const { arousal, valence, depth } = action
      return {
        ...state,
        arousal,
        valence,
        depth
      }
    }
    case "set-current-track-id": {
      return {
        ...state,
        trackId: action.trackId
      }
    }
    case "set-loading":
      return {
        ...state,
        loading: action.value
      }
    case "set-token":
      return {
        ...state,
        token: action.value
      }
    case "set-user-id":
      return {
        ...state,
        userId: action.value
      }
    default:
      return state
  }
}

function setTokenLocalStorage({ access_token, expires_in, refresh_token }) {
  if (access_token) {
    localStorage.setItem("access_token", access_token)
  }
  // if (expires_in) {
  //   localStorage.setItem("expires_in", Date.now() + expires_in * 1000)
  // }
  if (refresh_token) {
    localStorage.setItem("refresh_token", refresh_token)
  }
}

const spotifyService = request(
  () => localStorage.getItem("access_token"),
  () => localStorage.getItem("refresh_token"),
  setTokenLocalStorage
)

function AVD() {
  const [state, dispatch] = useReducer(reducer, initialState)

  window.state = state
  console.log(state)

  const { token, userId, loading, arousal, valence, depth } = state

  useEffect(
    () => {
      const url = new URL(location)
      const code = url.searchParams.get("code")
      if (code) {
        dispatch({ type: "set-loading", value: true })
        fetchToken(code).then(auth => {
          setTokenLocalStorage(auth)
          dispatch({ type: "set-token", value: auth.access_token })
          dispatch({ type: "set-loading", value: false })
          history.replaceState(null, null, "/")
        })
      }
      if (token) {
        dispatch({ type: "set-loading", value: true })
        spotifyService({ action: "v1/me" }).then(user => {
          dispatch({ type: "set-user-id", value: user.id })
          dispatch({ type: "set-loading", value: false })
        })
      }
    },
    [token]
  )

  return (
    <div className="avd">
      {!token && <a href={AUTH_URL}>Authorize</a>}
      {token && userId && (
        <Fragment>
          <CurrentTrack
            spotifyService={spotifyService}
            userId={userId}
            onChange={values => dispatch({ ...values, type: "set-avd" })}
          />
          <PlayList
            spotifyService={spotifyService}
            userId={userId}
            currentArousal={arousal}
            currentValence={valence}
            currentDepth={depth}
          />
        </Fragment>
      )}
      {loading && <Loading />}
    </div>
  )
}

ReactDOM.render(<AVD />, document.getElementById("root"))
