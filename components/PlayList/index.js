import React, { useEffect, useRef, useContext, useState } from "react"
import propTypes from "prop-types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import classNames from "classnames"
import api from "../../utils/api"
import Control from "./Control"
import Graph from "./Graph"
import { isErrorNoActiveDevice } from "../../utils/spotify"
import Following from "../Following"
import Store, { connect } from "../../store"
import {
  getTracks,
  filterUsers as filterUsersAction,
  filterLiked as filterLikedAction,
  loadPlaylists,
  loadPlaylist
} from "../../actions/index"
import Loading from "../Loading"
import PlayListSelector from "../PlayListSelector"
import "./PlayList.scss"
import { trackType, playlistType } from "../../utils/propTypes"
import spotifyService from "../../spotify"
import SelectPreset from "./SelectPreset"

function PlayList({
  userId,
  currentTrack,
  tracks,
  currentArousal = 0,
  currentValence = 0,
  currentDepth = 0,
  trackQuery,
  loading,
  activePlaylist,
  saved,
  name,
  playlists,
  playlistsLoading,
  havePlayer
}) {
  const { userFilter, filterUsers, liked: filterLiked, ...avd } = trackQuery
  const currentTrackId = currentTrack ? currentTrack.id : null
  const [showSearch, setShowSearch] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const { dispatch } = useContext(Store)
  const getTracksTimeout = useRef()

  async function savePlaylist() {
    if (!activePlaylist) {
      return createPlaylist()
    }
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
        method: "POST"
      }),
      api({
        action: "playlist",
        data: { id: activePlaylist.id, userId, name, trackQuery },
        method: "POST"
      })
    ])

    setShowSave(false)

    dispatch(loadPlaylists(userId))
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

    setShowSave(false)
    dispatch(loadPlaylists(userId))
  }

  function playPlaylist() {
    if (activePlaylist) {
      playTrack(tracks[0].id)
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
        dispatch(
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
    dispatch({ type: "set-track-query", query: updated })
    dispatch(getTracks(updated, true))
  }

  function setMin(key, value) {
    const updated = {
      ...avd,
      [key]: [Number(value), Math.max(Number(value), avd[key][1])]
    }
    dispatch({ type: "set-track-query", query: updated })
    getTracksDebounced(updated)
  }

  function setMax(key, value) {
    const updated = {
      ...avd,
      [key]: [Math.min(avd[key][0], Number(value)), Number(value)]
    }
    dispatch({ type: "set-track-query", query: updated })
    getTracksDebounced(updated)
  }

  useEffect(() => {
    dispatch(loadPlaylists(userId))
    getTracksDebounced(avd)
  }, [userId])

  const { arousal, valence, depth } = avd

  return (
    <div className="PlayListWrap">
      <div className={`PlayList ${loading && "loading"}`}>
        <div className="PlayListsHeader">
          <PlayListSelector
            playlists={playlists}
            activePlayList={activePlaylist && activePlaylist.id}
            displayMode="expanded"
            loading={playlistsLoading}
            onSelectPlayList={id => dispatch(loadPlaylist(id))}
            onSelectCreatePlayList={() => setShowSearch(!showSearch)}
          />
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

          {/* {hidden until i decide I dont want them} */}
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

          {currentTrackId &&
            (currentArousal > 0 || currentDepth > 0 || currentValence > 0) && (
              <button onClick={findSimilar}>Find Similar to this track</button>
            )}
          <div className="searchButtonWrap">
            <button
              className={classNames(showSearch ? "active" : "")}
              onClick={() => setShowSearch(!showSearch)}
            >
              Create New Playlist
            </button>
          </div>
        </div>
        {showSearch && (
          <div className="PlayListControlsWrap dialog">
            <h3>Search</h3>
            <div className="closeButton">
              <button onClick={() => setShowSearch(false)}>
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            <div className="PlayListControls">
              <SelectPreset />
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
              <Graph />
              <div className="PlayListOptions">
                <h4>Options</h4>
                <label>
                  <input
                    type="checkbox"
                    checked={filterLiked}
                    onChange={({ target: { checked } }) =>
                      dispatch(filterLikedAction(checked))
                    }
                  />
                  Liked
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={filterUsers}
                    onChange={({ target: { checked } }) =>
                      dispatch(filterUsersAction(checked))
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
              <button onClick={() => setShowSave(false)}>
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
                      dispatch({ type: "set-playlist-name", value })
                    }
                  />
                </div>
              </div>
              <div className="column">
                <label> </label>
                {!activePlaylist && name && (
                  <button onClick={createPlaylist}>Create Playlist</button>
                )}
                {activePlaylist && (
                  <button onClick={savePlaylist}>Save Playlist</button>
                )}
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
        {loading && (
          <div className="loadingWrap">
            <Loading />
          </div>
        )}
        {tracks.length > 0 && (
          <div className="PlayListTracks">
            <div className="PlayListHeader">
              {tracks.length > 0 && (
                <div className="PlayListPlay">
                  <button onClick={playPlaylist}>
                    <FontAwesomeIcon icon="play" />
                  </button>
                </div>
              )}
              <div className="PlayListTitle">
                <h2>
                  {name || "Unnamed Playlist"}
                  {name && !saved ? "*" : ""}
                </h2>
                <p className="subTitle">{tracks.length} tracks</p>
                <button onClick={() => dispatch(getTracks({}, true))}>
                  <FontAwesomeIcon icon="sync-alt" />
                </button>
              </div>
              <div className="PlayListActions">
                {tracks.length > 0 && (
                  <button
                    className={classNames(showSave ? "active" : "")}
                    onClick={() => setShowSave(!showSave)}
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
                {tracks.map((track, idx) => {
                  return (
                    <tr
                      key={`${track.id}_${idx}`}
                      className={track.id === currentTrackId ? "active" : ""}
                    >
                      <td>
                        <button onClick={() => playTrack(track.id)}>
                          <FontAwesomeIcon
                            icon={
                              track.id === currentTrackId ? "pause" : "play"
                            }
                          />
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

PlayList.propTypes = {
  userId: propTypes.string.isRequired,
  currentTrack: trackType,
  tracks: propTypes.arrayOf(trackType),
  currentArousal: propTypes.number,
  currentValence: propTypes.number,
  currentDepth: propTypes.number,
  trackQuery: propTypes.object,
  loading: propTypes.bool,
  activePlaylist: playlistType,
  name: propTypes.string,
  saved: propTypes.bool,
  playlists: propTypes.arrayOf(playlistType),
  playlistsLoading: propTypes.bool,
  havePlayer: propTypes.bool
}

const mapStateToProps = ({
  userId,
  currentTrack,
  arousal: currentArousal,
  valence: currentValence,
  depth: currentDepth,
  tracks,
  trackQuery,
  loadingPlaylist: loading,
  activePlaylist,
  playlistName: name,
  playlistSaved: saved,
  playlists,
  playlistsLoading,
  havePlayer
}) => ({
  userId,
  currentTrack,
  currentArousal,
  currentValence,
  currentDepth,
  tracks,
  trackQuery,
  loading,
  activePlaylist,
  name,
  saved,
  playlists,
  playlistsLoading,
  havePlayer
})

export default connect({ mapStateToProps })(PlayList)
