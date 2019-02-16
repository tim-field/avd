import api from "../utils/api"
import { hexToHsl } from "../utils/colors"
import spotifyService from "../spotify"

export const getTracks = (query = {}, withCurrent = false) => {
  return (dispatch, state) => {
    const apiQuery = {
      exclude: state.trackId,
      ...state.trackQuery,
      ...query
    }
    const {
      arousal,
      valence,
      depth,
      userFilter,
      filterLiked,
      filterUsers,
      trackId,
      ...rest
    } = apiQuery

    // Don't query unless we have some avd values
    if (
      arousal
        .concat(valence)
        .concat(depth)
        .find(x => x > 0)
    ) {
      dispatch({ type: "set-loading-playlist", value: true })
      api({
        action: "tracks",
        method: "GET",
        data: {
          ...rest,
          ...(filterUsers && { userFilter: userFilter.join(",") }),
          ...(filterLiked && { filterLiked: true }),
          ...(trackId && { exclude: trackId }),
          arousal: arousal.join(","),
          valence: valence.join(","),
          depth: depth.join(","),
          userId: state.userId
        }
      })
        .then(tracks => {
          const { currentTrack } = state
          dispatch({
            type: "set-tracks",
            tracks:
              withCurrent && currentTrack
                ? [currentTrack].concat(tracks)
                : tracks
          })
          dispatch({ type: "set-loading-playlist", value: false })
          if (withCurrent && currentTrack.name) {
            dispatch({ type: "set-playlist-name", value: currentTrack.name })
          }
        })
        .catch(e => {
          dispatch({ type: "set-loading-playlist", value: false })
          throw e
        })
    }
  }
}

export const getGraphTracks = (query = {}) => {
  return (dispatch, state) => {
    const apiQuery = {
      ...state.query,
      ...query
    }
    const { series, userFilter, filterLiked, filterUsers, ...rest } = apiQuery

    api({
      action: "graph-tracks",
      method: "POST",
      data: {
        ...rest,
        ...(filterUsers && { userFilter: userFilter.join(",") }),
        ...(filterLiked && { filterLiked: true }),
        series,
        userId: state.userId
      }
    }).then(tracks => {
      dispatch({ type: "set-tracks", tracks })
    })
  }
}

export const filterWithUser = (followingId, active) => {
  return (dispatch, state) => {
    dispatch({ type: "filter-with-user", userId: followingId, active })
    const trackQuery = state.trackQuery
    const userFilter = active
      ? trackQuery.userFilter.concat(followingId)
      : trackQuery.userFilter.filter(id => id !== followingId)
    dispatch(getTracks({ userFilter }))
  }
}

export const filterUsers = active => {
  return dispatch => {
    dispatch({ type: "filter-users", active })
    dispatch(getTracks({ filterUsers: active }))
  }
}

export const filterLiked = liked => {
  return dispatch => {
    dispatch({ type: "filter-liked", liked })
    dispatch(getTracks({ filterLiked: liked }))
  }
}

export const setCurrentTrack = spotifyTrack => {
  if (spotifyTrack.item) {
    const {
      item: {
        name,
        id,
        artists,
        album: { images }
      }
    } = spotifyTrack
    return {
      type: "set-current-track",
      track: {
        name,
        id,
        artist: artists.map(artist => artist.name).join(", "),
        image: images.find(i => i.height === 300) || images[1],
        raw: spotifyTrack
      }
    }
  }
}

export const loadPlaylists = userId => dispatch => {
  dispatch({ type: "playlists-loading", value: true })
  api({
    action: "playlists",
    data: {
      userId
    },
    method: "GET"
  })
    .then(usersPlaylists => {
      dispatch({ type: "playlists-loading", value: false })
      dispatch({
        type: "set-playlists",
        playlists: usersPlaylists
      })
    })
    .catch(e => {
      console.error(e)
      dispatch({ type: "playlists-loading", value: false })
    })
}

export const loadPlaylist = playlistId => dispatch => {
  if (playlistId) {
    dispatch({
      type: "set-loading-playlist",
      value: true
    })
    api({ action: `/playlist?id=${playlistId}` }).then(res => {
      dispatch({
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
      dispatch({
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
      dispatch({
        type: "set-loading-playlist",
        value: false
      })
    })
  }
}

export const loadListeners = trackId => dispatch => {
  dispatch({ type: "set-loading-listeners", value: true })
  api({ action: `avd/users?trackId=${trackId}` }).then(listeners => {
    dispatch({ type: "set-listeners", listeners })
  })
}

export const setTheme = theme => {
  // Work in progress
  const rootElement = document.getElementById("html")
  const currentTheme = rootElement.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"
  rootElement.style.setProperty("--theme", theme || newTheme)
  rootElement.setAttribute("data-theme", theme || newTheme)
}

export const setDisplayMode = mode => {
  const rootElement = document.getElementById("html")
  const currentMode = rootElement.getAttribute("data-mode")
  const newMode = currentMode === "condensed" ? "full" : "condensed"
  rootElement.setAttribute("data-mode", mode || newMode)
}

export const setFullScreen = (viewMode = true) => {
  if (!viewMode) {
    // exit fullscreen
    document.exitFullscreen()
  }
  if (document.fullscreenEnabled) {
    // supported
    // console.log('full screen is supported');
    document.documentElement.requestFullscreen()
  } else {
    console.info("full screen not supported")
  }
}

export const setColors = colors => {
  const values = {
    colors,
    color: colors[1],
    weaker: colors[0],
    weakest: colors[3],
    stronger: colors[5],
    text:
      hexToHsl(colors[0], "l") < 40 ? "rgba(229,229,229,.9)" : "rgba(0,0,0,.9)"
  }
  setDocumentColors(values)
  return { type: "set-colors", values }
}

export function setDocumentColors({ color, weaker, stronger, weakest, text }) {
  const rootElement = document.getElementById("html")
  rootElement.setAttribute("data-theme", "generated")

  document.documentElement.style.setProperty("--backgroundColor", weaker)
  document.documentElement.style.setProperty("--themeColor", color)
  document.documentElement.style.setProperty("--themeColor-weaker", weaker)
  document.documentElement.style.setProperty("--themeColor-stronger", stronger)
  document.documentElement.style.setProperty("--themeColor-weakest", weakest)
  document.documentElement.style.setProperty("--themeColor-strongest", stronger)
  document.documentElement.style.setProperty("--textColor", text)
}
