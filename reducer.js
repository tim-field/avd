export const initialState = {
  arousal: 0,
  valence: 0,
  depth: 0,
  loading: false,
  token: localStorage.getItem("access_token"),
  userId: localStorage.getItem("userId"),
  following: [],
  tracks: [],
  trackQuery: {
    arousal: [0, 0],
    valence: [0, 0],
    depth: [0, 0],
    userFilter: []
  }
}

export function reducer(state, action) {
  switch (action.type) {
    case "logout":
      return {
        ...initialState,
        token: null
      }
    case "set-avd": {
      const { arousal, valence, depth } = action
      return {
        ...state,
        arousal,
        valence,
        depth
      }
    }
    case "set-current-track-id": {
      return {
        ...state,
        trackId: action.trackId
      }
    }
    case "set-loading":
      return {
        ...state,
        loading: action.value
      }
    case "set-token":
      return {
        ...state,
        token: action.value
      }
    case "set-user-id":
      return {
        ...state,
        userId: action.value
      }
    case "set-following":
      return {
        ...state,
        following: action.following
      }
    case "filter-with-user":
      return {
        ...state,
        trackQuery: {
          ...state.trackQuery,
          userFilter: action.active
            ? state.trackQuery.userFilter.concat(action.userId)
            : state.trackQuery.userFilter.filter(id => id !== action.userId)
        }
      }
    case "set-tracks":
      return {
        ...state,
        playlistSaved: false,
        tracks: action.tracks
      }
    case "set-track-query":
      return {
        ...state,
        trackQuery: {
          ...state.trackQuery,
          ...action.query
        }
      }
    default:
      return state
  }
}
