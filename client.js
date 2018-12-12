import React, { useEffect, useState, Fragment, useRef } from "react"
import ReactDOM from "react-dom"
import { library } from "@fortawesome/fontawesome-svg-core"
import {
  faThumbsUp,
  faThumbsDown,
  faPause,
  faPlay,
  faStepBackward,
  faStepForward,
  faSearch
} from "@fortawesome/free-solid-svg-icons"
import request, { fetchToken, AUTH_URL } from "./utils/spotify"
import CurrentTrack from "./components/CurrentTrack"
import PlayList from "./components/PlayList"

library.add(
  faThumbsUp,
  faThumbsDown,
  faPause,
  faPlay,
  faStepBackward,
  faStepForward,
  faSearch
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
  const [playerReady, setPlayerReady] = useState(false)
  const player = useRef(null)

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

  useEffect(() => {
    player.current = new Spotify.Player({
      name: "AVD Player",
      getOAuthToken: cb => {
        cb(localStorage.getItem("access_token"))
      }
    })
    player.current.addListener("ready", ({ device_id }) => {
      console.log("Ready with Device ID", device_id)
      setPlayerReady(true)
    })
    player.current.addListener("initialization_error", ({ message }) => {
      console.error(message)
    })
    player.current.addListener("authentication_error", ({ message }) => {
      console.error(message)
    })
    player.current.connect()
  }, [])

  return (
    <div className="avd">
      {!token && <a href={AUTH_URL}>Authorize</a>}
      {token && (
        <div>
          {userId && (
            <Fragment>
              <CurrentTrack spotifyService={spotifyService} userId={userId} />
              <PlayList
                player={player.current}
                spotifyService={spotifyService}
              />
            </Fragment>
          )}
          {!userId && <p>Loading</p>}
        </div>
      )}
    </div>
  )
}

// window.onSpotifyWebPlaybackSDKReady = () => {
//   const player = new Spotify.Player({
//     name: "Web Playback SDK Quick Start Player",
//     getOAuthToken: cb => {
//       cb(localStorage.getItem("access_token"))
//     }
//   })
//   player.addListener("player_state_changed", state => {
//     console.log("yeah hmm k", state)
//   })
//   player.addListener("initialization_error", ({ message }) => {
//     console.error(message)
//   })
//   player.addListener("authentication_error", ({ message }) => {
//     console.error(message)
//   })
//   player.addListener("account_error", ({ message }) => {
//     console.error(message)
//   })
//   player.addListener("playback_error", ({ message }) => {
//     console.error(message)
//   })

//   // Ready
//   player.addListener("ready", ({ device_id }) => {
//     console.log("Ready with Device ID", device_id)
//   })

//   // Not Ready
//   player.addListener("not_ready", ({ device_id }) => {
//     console.log("Device ID has gone offline", device_id)
//   })

//   // Connect to the player!
//   player.connect()
// }

window.onSpotifyWebPlaybackSDKReady = () => {
  ReactDOM.render(<AVD />, document.getElementById("root"))
}
