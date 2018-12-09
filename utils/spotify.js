import r, { urlParamify } from "./request"

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const HOST = process.env.HOST
const PORT = process.env.PORT

export const AUTH_URL =
  "https://accounts.spotify.com/authorize?" +
  urlParamify({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: location.href,
    scope: `user-read-playback-state user-modify-playback-state`
  })

const serverURL = `${HOST}:${PORT}` // TODO

async function refreshToken(token, onAuth) {
  const auth = await r(
    `${serverURL}/refresh?${urlParamify({ refresh_token: token })}`
  )
  if (onAuth) onAuth(auth)
  return auth
}

export async function fetchToken(code, onAuth) {
  const auth = await r(`${serverURL}/authorize?${urlParamify({ code })}`)
  if (onAuth) onAuth(auth)
  return auth
}

export default function request(getToken, getRefreshToken, onAuth) {
  let refreshPromise = null
  const api = async (action, method = "GET", options = {}) =>
    r(`https://api.spotify.com/${action}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      method,
      ...options
    }).catch(e => {
      if (e.response && e.response.status === 401) {
        console.log("this is a 401")
        if (refreshPromise) {
          return refreshPromise.then(() => api(action, method, options))
        } else {
          const token = getRefreshToken()
          if (token) {
            refreshPromise = refreshToken(token, onAuth).then(() => {
              refreshPromise = null
              return api(action, method, options)
            })
            return refreshPromise
          }
        }
      }
      throw e
    })
  return api
}
