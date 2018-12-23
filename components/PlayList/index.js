import React, { useReducer, Fragment, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import api from "../../utils/api"
import Control from "./Control"
import "./style.css"

const initialState = {
  arousal: [0, 0],
  valence: [0, 0],
  depth: [0, 0],
  tracks: [],
  playlists: [],
  name: "AVD",
  loading: false,
  saved: false
}

function reducer(state, action) {
  switch (action.type) {
    case "set-min":
      return {
        ...state,
        saved: false,
        [action.name]: [
          action.value,
          Math.max(action.value, state[action.name][1])
        ]
      }
    case "set-max":
      return {
        ...state,
        saved: false,
        [action.name]: [
          Math.min(state[action.name][0], action.value),
          action.value
        ]
      }
    case "set-min-max":
      return {
        ...state,
        saved: false,
        [action.name]: [action.min, action.max]
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
    { arousal, valence, depth, name, tracks, playlists, activePlaylist, saved },
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
      data: { id: activePlaylist.id, name, userId, arousal, valence, depth }
    })

    dispatch({ type: "set-saved", value: true })
  }

  async function createPlaylist(name) {
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
        ;["arousal", "valence", "depth"].forEach(name => {
          if (res[name]) {
            dispatch({
              type: "set-min-max",
              name,
              min: res[name][0],
              max: res[name][1]
            })
          }
        })
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
  }

  function getTracks(arousal, valence, depth) {
    api({
      action: `tracks?arousal=${arousal}&valence=${valence}&depth=${depth}`
    }).then(tracks => {
      dispatch({ type: "set-tracks", tracks })
      dispatch({ type: "set-loading", value: false })
    })
  }

  function getTracksDebounced(arousal, valence, depth, wait = 400) {
    clearTimeout(getTracksTimeout.current)
    getTracksTimeout.current = setTimeout(
      () => getTracks(arousal, valence, depth),
      wait
    )
  }

  function findSimilar() {
    dispatch({
      type: "set-min-max",
      name: "arousal",
      min: Math.max(currentArousal - 1, 0),
      max: Math.min(currentArousal + 1, 11)
    })
    dispatch({
      type: "set-min-max",
      name: "valence",
      min: Math.max(currentValence - 1, 0),
      max: Math.min(currentValence + 1, 11)
    })
    dispatch({
      type: "set-min-max",
      name: "depth",
      min: Math.max(currentDepth - 1),
      max: Math.min(currentDepth + 1, 11)
    })
  }

  useEffect(
    () => {
      if (arousal || valence || depth) {
        dispatch({ type: "set-loading", value: true })
        getTracksDebounced(arousal, valence, depth)
      }
    },
    [arousal, valence, depth]
  )

  useEffect(() => {
    loadPlaylists()
  }, [])

  return (
    <div className="playlist">
      <button onClick={() => findSimilar()}>Find Similar</button>
      <div className="searchControls">
        <Control
          label="Arousal"
          min={arousal[0]}
          max={arousal[1]}
          setMin={value =>
            dispatch({ type: "set-min", name: "arousal", value })
          }
          setMax={value =>
            dispatch({ type: "set-max", name: "arousal", value })
          }
        />
        <Control
          label="Valence"
          min={valence[0]}
          max={valence[1]}
          setMin={value =>
            dispatch({ type: "set-min", name: "valence", value })
          }
          setMax={value =>
            dispatch({ type: "set-max", name: "valence", value })
          }
        />
        <Control
          label="Depth"
          min={depth[0]}
          max={depth[1]}
          setMin={value => dispatch({ type: "set-min", name: "depth", value })}
          setMax={value => dispatch({ type: "set-max", name: "depth", value })}
        />
      </div>
      {tracks.length > 0 && (
        <div>
          <label>Playlist Name</label>
          <input
            type="text"
            value={name}
            onChange={({ target: { value } }) =>
              dispatch({ type: "set-name", value })
            }
          />
          {!activePlaylist && (
            <button onClick={() => createPlaylist(name)}>
              Create Playlist
            </button>
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
      {tracks.length > 0 && (
        <table id="playlistTracks">
          <caption>{saved ? activePlaylist.name : "Unsaved Playlist"}</caption>
          <thead>
            <tr>
              <th />
              <th>Title</th>
              <th>Artist</th>
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
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
