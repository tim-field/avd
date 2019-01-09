export const initialState = {
  arousal: 0,
  valence: 0,
  depth: 0,
  loading: false,
  token: localStorage.getItem("access_token"),
  userId: localStorage.getItem("userId"),
  following: []
}

export function reducer(state, action) {
  switch (action.type) {
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
    default:
      return state
  }
}
