import request from "./request"

const HOST = process.env.HOST
const PORT = process.env.PORT

const serverURL = `${HOST}:${PORT}` // TODO

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
