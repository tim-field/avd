import api from "../utils/api"

export function getTracks(query = {}) {
  return (dispatch, state) => {
    const apiQuery = {
      ...state.trackQuery,
      ...query
    }
    console.log('in get tracks')
    const { arousal, valence, depth, userFilter } = apiQuery
    api({
      action: `tracks?userId=${state.userId}&arousal=${arousal}&valence=${valence}&depth=${depth}&userFilter=${userFilter}`
    }).then(tracks => {
      dispatch({ type: "set-tracks", tracks })
    })
  }
}

export function filterWithUser(followingId, active) {
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
