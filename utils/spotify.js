import r, { urlParamify } from "./request"

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const API_URL = process.env.API_URL

export const AUTH_URL =
  "https://accounts.spotify.com/authorize?" +
  urlParamify({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: location.href,
    scope: `user-read-playback-state user-modify-playback-state playlist-modify-public playlist-modify-private`
    // scope: `user-read-playback-state user-modify-playback-state streaming user-read-birthdate user-read-email user-read-private`
  })

async function refreshToken(token, onAuth) {
  const auth = await r(
    `${API_URL}/refresh?${urlParamify({ refresh_token: token })}`
  )
  if (onAuth) onAuth(auth)
  return auth
}

export async function fetchToken(code, onAuth) {
  const auth = await r(`${API_URL}/authorize?${urlParamify({ code })}`)
  if (onAuth) onAuth(auth)
  return auth
}

export default function request(getToken, getRefreshToken, onAuth) {
  let refreshPromise = null
  const api = async ({ action, data, method, options = {} }) =>
    r(`https://api.spotify.com/${action}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      method: method ? method : data ? "POST" : "GET",
      ...options,
      body: data && JSON.stringify(data)
    }).catch(e => {
      if (e.response && e.response.status === 401) {
        console.log("this is a 401")
        if (refreshPromise) {
          return refreshPromise.then(() =>
            api({ action, data, method, options })
          )
        } else {
          const token = getRefreshToken()
          if (token) {
            refreshPromise = refreshToken(token, onAuth).then(() => {
              refreshPromise = null
              return api({ action, data, method, options })
            })
            return refreshPromise
          }
        }
      }
      throw e
    })
  return api
}
