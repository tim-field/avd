export function urlParamify(params = {}) {
  const urlValues = Object.keys(params).reduce((urlParams, k) => {
    if (Array.isArray(params[k])) {
      params[k].forEach(value => {
        if (value !== undefined) {
          urlParams.append(k, value)
        }
      })
    } else if (params[k] !== undefined) {
      urlParams.append(k, params[k])
    }
    return urlParams
  }, new URLSearchParams())

  return urlValues.toString()
}

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json()
  }
  // console.warn("Non JSON response!") // eslint-disable-line
  return response.text()
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }

  return parseJSON(response).then(body => {
    const error = new Error(response.statusText || `${response.status} error`)
    // eslint-disable-next-line
    error.response = response
    // eslint-disable-next-line
    error.responseBody = body
    throw error
  })
}


/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export default function request(url, options) {
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
}
