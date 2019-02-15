import { omit } from "ramda"
export const initialState = {
  arousal: 0,
  valence: 0,
  depth: 0,
  loading: false,
  loadingPlaylist: false,
  playlistName: "",
  playlistSaved: false,
  playlistsLoading: false,
  playlists: [],
  token: localStorage.getItem("access_token"),
  userId: localStorage.getItem("userId"),
  following: [],
  tracks: [],
  trackQuery: {
    series: {},
    arousal: [0, 0],
    valence: [0, 0],
    depth: [0, 0],
    userFilter: [],
    filterUsers: false,
    filterLiked: false
  },
  colors: {
    text: "#333",
    color: "#b9638b",
    weakest: "#1d0e1d",
    weaker: "#410a24",
    stronger: "#521452",
    strongest: "#dbbcdb"
  },
  havePlayer: true
}

export function reducer(state, action) {
  switch (action.type) {
    case "set-loading":
      return {
        ...state,
        loading: action.value
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
    case "set-playlist-name":
      return {
        ...state,
        playlistName: action.value,
        playlistSaved: false
      }
    case "set-active-playlist":
      return {
        ...state,
        playlistSaved: true,
        playlistName: action.playlist.name,
        activePlaylist: action.playlist
      }
    case "set-playlists":
      return {
        ...state,
        playlists: action.playlists
      }
    case "playlists-loading":
      return {
        ...state,
        playlistsLoading: action.value
      }
    case "set-current-track": {
      return action.track
        ? {
            ...state,
            trackId: action.track && action.track.id,
            currentTrack: action.track
          }
        : omit(["trackId", "currentTrack"], state)
    }
    case "set-have-player":
      return {
        ...state,
        havePlayer: action.value
      }
    case "set-colors": {
      return {
        ...state,
        colors: action.values
      }
    }
    case "set-loading-playlist":
      return {
        ...state,
        loadingPlaylist: action.value
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
    case "set-user":
      return {
        ...state,
        user: action.user,
        userId: action.user.id
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
    case "set-tracks": {
      return {
        ...state,
        playlistSaved: false,
        tracks: action.tracks
      }
    }
    case "set-track-query":
      return {
        ...state,
        trackQuery: {
          ...state.trackQuery,
          ...action.query
        }
      }
    case "filter-users":
      return {
        ...state,
        trackQuery: {
          ...state.trackQuery,
          filterUsers: action.active
        }
      }
    case "filter-liked":
      return {
        ...state,
        trackQuery: {
          ...state.trackQuery,
          filterLiked: action.liked
        }
      }
    case "logout":
      return {
        ...initialState,
        token: null
      }

    default:
      return state
  }
}
