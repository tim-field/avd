import api from "../utils/api"
import { hexToHsl } from "../utils/colors"

export const getTracks = (query = {}) => {
  return (dispatch, state) => {
    const apiQuery = {
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
          arousal: arousal.join(","),
          valence: valence.join(","),
          depth: depth.join(","),
          userId: state.userId
        }
      })
        .then(tracks => {
          dispatch({ type: "set-tracks", tracks })
          dispatch({ type: "set-loading-playlist", value: false })
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
