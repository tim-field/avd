import React, {
  useReducer,
  Fragment,
  useEffect,
  useRef,
  useContext
} from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import classNames from "classnames"
import api from "../../utils/api"
import Control from "./Control"
import { isErrorNoActiveDevice } from "../../utils/spotify"
import Following from "../Following"
import Store, { connect } from "../../store"
import {
  getTracks,
  filterUsers as filterUsersAction,
  filterLiked as filterLikedAction
} from "../../actions/index"
import "./PlayList.scss"

const initialState = {
  playlists: [],
  name: "",
  loading: false,
  saved: false,
  havePlayer: true,
  showSearch: false,
  showSave: false
}

function reducer(state, action) {
  switch (action.type) {
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
    case "set-playlists":
      return {
        ...state,
        playlists: action.playlists
      }
    case "set-active-playlist":
      return {
        ...state,
        saved: true,
        name: action.playlist.name,
        activePlaylist: action.playlist
      }
    case "set-have-player":
      return {
        ...state,
        havePlayer: action.value
      }
    // @TIM: is this how I set a state??
    case "set-show-search":
      return {
        ...state,
        showSearch: action.value
      }
    case "set-show-save":
      return {
        ...state,
        showSave: action.value
      }
    default:
      return state
  }
}

function PlayList({
  spotifyService,
  userId,
  currentTrack,
  tracks,
  currentArousal = 0,
  currentValence = 0,
  currentDepth = 0,
  trackQuery
}) {
  const { userFilter, filterUsers, liked: filterLiked, ...avd } = trackQuery
  const [
    {
      name,
      playlists,
      activePlaylist,
      saved,
      havePlayer,
      showSearch,
      showSave
    },
    dispatch
  ] = useReducer(reducer, initialState)
  const { dispatch: appDispatch } = useContext(Store)
  const getTracksTimeout = useRef()

  async function loadPlaylists() {
    const usersPlaylists = await api({
      action: `playlists?userId=${userId}`
    })
    dispatch({
      type: "set-playlists",
      playlists: usersPlaylists
    })
  }

  async function savePlaylist() {
    await Promise.all([
      spotifyService({
        action: `v1/playlists/${activePlaylist.id}`,
        data: { name },
        method: "PUT"
      }),
      spotifyService({
        action: `v1/playlists/${activePlaylist.id}/tracks`,
        data: {
          uris: tracks.map(track => `spotify:track:${track.id}`)
        },
        method: "PUT"
      }),
      api({
        action: "playlist",
        data: { id: activePlaylist.id, userId, name, trackQuery },
        method: "POST"
      })
    ])

    loadPlaylists()
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
        trackQuery
      },
      method: "POST"
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
        appDispatch({
          type: "set-track-query",
          query: res.trackQuery || {
            // handles legacy table columns
            arousal: res.arousal,
            valence: res.valence,
            depth: res.depth
          }
        })
      })

      spotifyService({
        action: `v1/playlists/${playlistId}`
      }).then(playlist => {
        appDispatch({
          type: "set-tracks",
          tracks: playlist.tracks.items.map(({ track }) => ({
            name: track.name,
            id: track.id,
            artist: track.artists.map(artist => artist.name).join(", ")
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

  function getTracksDebounced(query, wait = 400) {
    clearTimeout(getTracksTimeout.current)
    getTracksTimeout.current = setTimeout(
      () =>
        appDispatch(
          getTracks({
            userIds: userFilter,
            ...avd,
            ...query
          })
        ),
      wait
    )
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
    appDispatch({ type: "set-track-query", query: updated })
    appDispatch(getTracks(updated))
  }

  function setMin(key, value) {
    const updated = {
      ...avd,
      [key]: [Number(value), Math.max(Number(value), avd[key][1])]
    }
    appDispatch({ type: "set-track-query", query: updated })
    getTracksDebounced(updated)
  }

  function setMax(key, value) {
    const updated = {
      ...avd,
      [key]: [Math.min(avd[key][0], Number(value)), Number(value)]
    }
    appDispatch({ type: "set-track-query", query: updated })
    getTracksDebounced(updated)
  }

  useEffect(
    () => {
      loadPlaylists()
      getTracksDebounced(avd)
    },
    [userId]
  )

  const { arousal, valence, depth } = avd

  return (
    <div className="PlayListWrap">
      <div className="PlayList">
        <div className="PlayListsHeader">
          {playlists.length > 0 && (
            <div className="PlayListSelect">
              <h4>Playlist</h4>
              <select
                className="select"
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
          {/* {!name && (
            <div className="PlayListTitleWrap">
              <h4>{tracks.length > 0 && <span>Unnamed Playlist</span>}</h4>
            </div>
          )} */}
          {/* {activePlaylist && (
            <div className="PlayListPlay">
              <Fragment>
                <button onClick={playPlaylist}>
                  <FontAwesomeIcon icon="play" />
                </button>
              </Fragment>
            </div>
          )} */}
          {
            //   tracks.length > 0 && (
            //   <button
            //     className={classNames(showSave ? "active" : "")}
            //     onClick={() =>
            //       dispatch({
            //         type: "set-show-save",
            //         value: !showSave
            //       })
            //     }
            //   >
            //     Save Playlist...
            //   </button>
            // )
          }
          {
            //   tracks.length > 0 && (
            //   <div className="PlayListsEdit">
            //     {/* <label>Name </label> */}
            //     <div className="inputWrap">
            //       <input
            //         type="text"
            //         value={name || 'unnamed playlist'}
            //         onChange={({ target: { value } }) =>
            //           dispatch({ type: "set-name", value })
            //         }
            //       />
            //       {!activePlaylist && name && (
            //         <button onClick={createPlaylist}>Create Playlist</button>
            //       )}
            //       <button onClick={() => savePlaylist()}>Save Playlist</button>
            //     </div>
            //   </div>
            // )
          }

          {currentTrack &&
            (currentArousal > 0 || currentDepth > 0 || currentValence > 0) && (
              <button onClick={() => findSimilar()}>
                Find Similar to this track
              </button>
            )}
          <div className="searchButtonWrap">
            <button
              className={classNames(showSearch ? "active" : "")}
              onClick={() =>
                dispatch({
                  type: "set-show-search",
                  value: !showSearch
                })
              }
            >
              Create New Playlist
            </button>
          </div>
        </div>
        {showSearch && (
          <div className="PlayListControlsWrap dialog">
            <h3>Search</h3>
            <div className="closeButton">
              <button
                onClick={() =>
                  dispatch({
                    type: "set-show-search",
                    value: false
                  })
                }
              >
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            <div className="PlayListControls">
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
              <div className="PlayListOptions">
                <h4>Options</h4>
                <label>
                  <input
                    type="checkbox"
                    checked={filterLiked}
                    onChange={({ target: { checked } }) =>
                      appDispatch(filterLikedAction(checked))
                    }
                  />
                  Liked
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={filterUsers}
                    onChange={({ target: { checked } }) =>
                      appDispatch(filterUsersAction(checked))
                    }
                  />
                  Filter Users
                </label>
              </div>
            </div>
            {filterUsers && <Following />}
          </div>
        )}
        {showSave && tracks.length > 0 && (
          <div className="PlayListsEdit edit dialog">
            <h3>Save playlist</h3>
            <div className="closeButton">
              <button
                onClick={() =>
                  dispatch({
                    type: "set-show-save",
                    value: false
                  })
                }
              >
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            {/* <label>Name </label> */}
            <div className="row">
              <div className="column">
                <label>Name </label>
                <div className="inputWrap">
                  <input
                    type="text"
                    value={name || "unnamed playlist"}
                    onChange={({ target: { value } }) =>
                      dispatch({ type: "set-name", value })
                    }
                  />
                </div>
              </div>
              <div className="column">
                <label> </label>
                {!activePlaylist && name && (
                  <button onClick={createPlaylist}>Create Playlist</button>
                )}
                <button onClick={() => savePlaylist()}>Save Playlist</button>
              </div>
            </div>
          </div>
        )}
        {!havePlayer && (
          <div>
            Can&#39;t find a Spotify player! Please make sure you&#39;ve got
            Spotify open and playing somewhere.
          </div>
        )}
        {tracks.length > 0 && (
          <div className="PlayListTracks">
            <div className="PlayListHeader">
              {tracks.length > 0 && (
                <div className="PlayListPlay">
                  <Fragment>
                    <button onClick={playPlaylist}>
                      <FontAwesomeIcon icon="play" />
                    </button>
                  </Fragment>
                </div>
              )}
              <div className="PlayListTitle">
                <h2>
                  {name || "Unnamed Playlist"}
                  {name && !saved ? "*" : ""}
                </h2>
                <p className="subTitle">{tracks.length} tracks</p>
              </div>
              <div className="PlayListActions">
                {tracks.length > 0 && (
                  <button
                    className={classNames(showSave ? "active" : "")}
                    onClick={() =>
                      dispatch({
                        type: "set-show-save",
                        value: !showSave
                      })
                    }
                  >
                    Save Playlist...
                  </button>
                )}
              </div>
            </div>
            <table id="playlistTracks">
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
          </div>
        )}
      </div>
    </div>
  )
}

const mapStateToProps = state => {
  const {
    userId,
    trackId: currentTrack,
    arousal: currentArousal,
    valence: currentValence,
    depth: currentDepth,
    tracks,
    trackQuery
  } = state
  return {
    userId,
    currentTrack,
    currentArousal,
    currentValence,
    currentDepth,
    tracks,
    trackQuery
  }
}

export default connect({ mapStateToProps })(PlayList)
