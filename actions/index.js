import api from "../utils/api"

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
      }).then(tracks => {
        dispatch({ type: "set-tracks", tracks })
      })
    }
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
