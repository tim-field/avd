import React, { useContext, useEffect, Fragment } from "react"
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
import api from "./utils/api"
import Store, { Provider } from "./store"

library.add(
  faThumbsUp,
  faThumbsDown,
  faPause,
  faPlay,
  faStepBackward,
  faStepForward
)

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
  const { state, dispatch } = useContext(Store)
  const { token, trackId, userId, loading, arousal, valence, depth } = state

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
          api({ action: "user", data: { user } })
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
            arousal={arousal}
            valence={valence}
            depth={depth}
          />
          <PlayList
            spotifyService={spotifyService}
            userId={userId}
            currentTrack={trackId}
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

function App() {
  return (
    <Provider>
      <AVD />
    </Provider>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
