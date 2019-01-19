import api from "../utils/api"

export const getTracks = (query = {}) => {
  return (dispatch, state) => {
    const apiQuery = {
      ...state.trackQuery,
      ...query
    }
    const { arousal, valence, depth, userFilter, filterUsers } = apiQuery
    api({
      action: `tracks?userId=${
        state.userId
      }&arousal=${arousal}&valence=${valence}&depth=${depth}&userFilter=${
        filterUsers ? userFilter : ""
      }`
    }).then(tracks => {
      dispatch({ type: "set-tracks", tracks })
    })
  }
}

export const filterWithUser = (followingId, active) => {
  return (dispatch, state) => {
    // move this to an action
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
    // move this to an action
    dispatch({ type: "filter-users", active })
    dispatch(getTracks({ filterUsers: active }))
  }
}
