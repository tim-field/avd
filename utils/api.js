import request from "./request"

const serverURL = process.env.API_URL

export default function api({ action, data, method, options = {} }) {
  return request(`${serverURL}/${action.replace(/^\//, "")}`, {
    method: method ? method : data ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json"
    },
    ...options,
    body: data && JSON.stringify(data)
  })
}
