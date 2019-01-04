import React, { useReducer, Fragment, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import api from "../../utils/api"
import Control from "./Control"
import "./style.css"
import { isErrorNoActiveDevice } from "../../utils/spotify"

const initialState = {
  tracks: [],
  playlists: [],
  name: "",
  loading: false,
  saved: false,
  havePlayer: true,
  avd: {
    arousal: [0, 0],
    valence: [0, 0],
    depth: [0, 0]
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "set-avd":
      return {
        ...state,
        avd: action.avd
      }
    case "set-name":
      return {
        ...state,
        saved: false,
        name: action.value
      }
    case "set-loading":
      return {
        ...state,
        loading: action.value
      }
    case "set-tracks":
      return {
        ...state,
        saved: false,
        tracks: action.tracks
      }
    case "set-playlists":
      return {
        ...state,
        playlists: action.playlists
      }
    case "set-active-playlist":
      return {
        ...state,
        saved: true,
        activePlaylist: action.playlist
      }
    case "set-have-player":
      return {
        ...state,
        havePlayer: action.value
      }
    default:
      return state
  }
}

export default function PlayList({
  spotifyService,
  userId,
  currentArousal = 0,
  currentValence = 0,
  currentDepth = 0
}) {
  const [
    { avd, name, tracks, playlists, activePlaylist, saved, havePlayer },
    dispatch
  ] = useReducer(reducer, initialState)
  const getTracksTimeout = useRef()

  async function loadPlaylists() {
    const playlists = await api({
      action: `playlists?userId=${userId}`
    })
    dispatch({
      type: "set-playlists",
      playlists
    })
  }

  function savePlaylist() {
    spotifyService({
      action: `v1/playlists/${activePlaylist.id}`,
      data: { name },
      method: "PUT"
    })

    spotifyService({
      action: `v1/playlists/${activePlaylist.id}/tracks`,
      data: {
        uris: tracks.map(track => `spotify:track:${track.id}`)
      },
      method: "PUT"
    })

    api({
      action: "playlists",
      data: { ...avd, id: activePlaylist.id, name, userId },
      method: "POST"
    })

    dispatch({ type: "set-saved", value: true })
  }

  async function createPlaylist() {
    const playlist = await spotifyService({
      action: "v1/me/playlists",
      data: { name }
    })

    spotifyService({
      action: `v1/playlists/${playlist.id}/tracks`,
      data: {
        uris: tracks.map(track => `spotify:track:${track.id}`)
      }
    })

    dispatch({
      type: "set-active-playlist",
      playlist
    })

    await api({
      action: "playlist",
      data: {
        id: playlist.id,
        name,
        userId,
        arousal,
        valence,
        depth
        // playlist
      }
    })

    loadPlaylists()
  }

  function playPlaylist() {
    if (activePlaylist) {
      spotifyService({
        action: "v1/me/player/play",
        data: { context_uri: activePlaylist.uri },
        method: "PUT"
      })
    }
  }

  function loadPlaylist(playlistId) {
    if (playlistId) {
      api({ action: `/playlist?id=${playlistId}` }).then(res => {
        const { arousal, valence, depth } = res
        dispatch({ type: "set-avd", avd: { arousal, valence, depth } })
      })

      spotifyService({
        action: `v1/playlists/${playlistId}`
      }).then(playlist => {
        dispatch({
          type: "set-tracks",
          tracks: playlist.tracks.items.map(({ track }) => ({
            name: track.name,
            id: track.id,
            artist: track.artists.map(({ name }) => name).join(", ")
          }))
        })
        dispatch({
          type: "set-active-playlist",
          playlist
        })
        dispatch({
          type: "set-name",
          value: playlist.name
        })
      })
    }
  }

  function playTrack(trackId) {
    spotifyService({
      action: `v1/me/player/play`,
      method: "PUT",
      data: {
        uris: tracks.map(t => `spotify:track:${t.id}`),
        offset: { uri: `spotify:track:${trackId}` }
      }
    })
      .then(() => {
        if (!havePlayer) {
          dispatch({
            type: "set-have-player",
            value: true
          })
        }
      })
      .catch(e => {
        if (isErrorNoActiveDevice(e)) {
          dispatch({
            type: "set-have-player",
            value: false
          })
        }
      })
  }

  function getTracks({ arousal, valence, depth }) {
    api({
      action: `tracks?arousal=${arousal}&valence=${valence}&depth=${depth}&userId=${userId}`
    }).then(tracks => {
      dispatch({ type: "set-tracks", tracks })
      dispatch({ type: "set-loading", value: false })
    })
  }

  function getTracksDebounced(avd, wait = 400) {
    clearTimeout(getTracksTimeout.current)
    getTracksTimeout.current = setTimeout(() => getTracks(avd), wait)
  }

  function findSimilar() {
    const updated = {
      arousal: currentArousal
        ? [Math.max(currentArousal - 1, 0), Math.min(currentArousal + 1, 11)]
        : [0, 0],
      valence: currentValence
        ? [Math.max(currentValence - 1, 0), Math.min(currentValence + 1, 11)]
        : [0, 0],
      depth: currentDepth
        ? [Math.max(currentDepth - 1, 0), Math.min(currentDepth + 1, 11)]
        : [0, 0]
    }
    dispatch({ type: "set-avd", avd: updated })
    getTracks(updated)
  }

  function setMin(name, value) {
    const updated = {
      ...avd,
      [name]: [Number(value), Math.max(Number(value), avd[name][1])]
    }
    dispatch({ type: "set-avd", avd: updated })
    getTracksDebounced(updated)
  }

  function setMax(name, value) {
    const updated = {
      ...avd,
      [name]: [Math.min(avd[name][0], Number(value)), Number(value)]
    }
    dispatch({ type: "set-avd", avd: updated })
    getTracksDebounced(updated)
  }

  useEffect(() => {
    loadPlaylists()
    getTracksDebounced(avd)
  }, [])

  const { arousal, valence, depth } = avd

  return (
    <div className="playlist">
      <button onClick={() => findSimilar()}>Find Similar</button>
      <div className="searchControls">
        <Control
          label="Arousal"
          min={arousal[0]}
          max={arousal[1]}
          setMin={value => setMin("arousal", value)}
          setMax={value => setMax("arousal", value)}
        />
        <Control
          label="Valence"
          min={valence[0]}
          max={valence[1]}
          setMin={value => setMin("valence", value)}
          setMax={value => setMax("valence", value)}
        />
        <Control
          label="Depth"
          min={depth[0]}
          max={depth[1]}
          setMin={value => setMin("depth", value)}
          setMax={value => setMax("depth", value)}
        />
      </div>
      {tracks.length > 0 && (
        <div>
          <label>Playlist Name </label>
          <input
            type="text"
            value={name}
            onChange={({ target: { value } }) =>
              dispatch({ type: "set-name", value })
            }
          />
          {!activePlaylist && name && (
            <button onClick={createPlaylist}>Create Playlist</button>
          )}
          {activePlaylist && (
            <Fragment>
              <button onClick={() => savePlaylist()}>Save Playlist</button>
              <button onClick={playPlaylist}>
                <FontAwesomeIcon icon="play" />
              </button>
            </Fragment>
          )}
        </div>
      )}
      {playlists.length > 0 && (
        <div>
          <select
            value={activePlaylist && activePlaylist.id}
            onChange={({ target: { value } }) => loadPlaylist(value)}
          >
            <option />
            {playlists.map(playlist => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {!havePlayer && (
        <div>
          Can't find a Spotify player! Please make sure you've got Spotify open
          and playing somewhere.
        </div>
      )}
      {tracks.length > 0 && (
        <table id="playlistTracks">
          <caption>
            {name}
            {name && !saved ? "*" : ""}
          </caption>
          <thead>
            <tr>
              <th />
              <th>Title</th>
              <th>Artist</th>
              <th>
                <abbr title="Arousal">A</abbr>
              </th>
              <th>
                <abbr title="Valence">V</abbr>
              </th>
              <th>
                <abbr title="Depth">D</abbr>
              </th>
            </tr>
          </thead>
          <tbody>
            {tracks.map(track => {
              return (
                <tr key={track.id}>
                  <td>
                    <button onClick={() => playTrack(track.id)}>
                      <FontAwesomeIcon icon="play" />
                    </button>
                  </td>
                  <td>{track.name}</td>
                  <td>{track.artist}</td>
                  <td>{track.arousal}</td>
                  <td>{track.valence}</td>
                  <td>{track.depth}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
