import React, { useContext, useEffect, Fragment } from "react"
import ReactDOM from "react-dom"
import { library } from "@fortawesome/fontawesome-svg-core"
import {
  faThumbsUp,
  faThumbsDown,
  faPause,
  faPlay,
  faStepBackward,
  faStepForward,
  faTimes,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons"
import request, { fetchToken, AUTH_URL } from "./utils/spotify"
import CurrentTrack from "./components/CurrentTrack"
import PlayList from "./components/PlayList"
import Loading from "./components/Loading"
import Header from "./components/Header"
import api from "./utils/api"
import Store, { Provider } from "./store"
require("typeface-open-sans")
import "./style.css"
import "./styles/_global.scss"
import { setTheme, setDisplayMode } from "./actions"

library.add(
  faThumbsUp,
  faThumbsDown,
  faPause,
  faPlay,
  faStepBackward,
  faStepForward,
  faTimes,
  faTimesCircle
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
          api({ action: "user", data: { user } })
          dispatch({ type: "set-user", user })
          dispatch({ type: "set-loading", value: false })
        })
      }
    },
    [token]
  )

  const doLogout = () => {
    localStorage.removeItem("refresh_token")
    dispatch({ type: "logout" })
    localStorage.removeItem("access_token")
  }

  return (
    <div className="avd">
      {!token && (
        <div className="authLink">
          <a href={AUTH_URL}>Authorize</a>
        </div>
      )}
      {token && userId && (
        <Fragment>
          <Header
            doLogout={doLogout}
            toggleUI={setTheme}
            setDisplayMode={setDisplayMode}
          />
          <CurrentTrack
            spotifyService={spotifyService}
            userId={userId}
            arousal={arousal}
            valence={valence}
            depth={depth}
          />
          <PlayList spotifyService={spotifyService} />
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
