import React, { useEffect, useState } from "react"
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
  const [token, setToken] = useState(localStorage.getItem("access_token"))
  const [userId, setUserId] = useState(localStorage.getItem("userId"))

  useEffect(
    () => {
      const url = new URL(location)
      const code = url.searchParams.get("code")
      if (code) {
        fetchToken(code).then(auth => {
          setTokenLocalStorage(auth)
          setToken(auth.access_token)
          history.replaceState(null, null, "/")
        })
      }
      if (token) {
        spotifyService("v1/me").then(user => {
          localStorage.setItem("userId", user.id)
          setUserId(user.id)
        })
      }
    },
    [token]
  )

  return (
    <div className="avd">
      {!token && <a href={AUTH_URL}>Authorize</a>}
      {token && (
        <div>
          {userId && (
            <CurrentTrack spotifyService={spotifyService} userId={userId} />
          )}
          {!userId && <p>Loading</p>}
        </div>
      )}
    </div>
  )
}

ReactDOM.render(<AVD />, document.getElementById("root"))
