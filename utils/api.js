import request, { urlParamify } from "./request"

const serverURL = process.env.API_URL

export default function api({ action, data, method, options = {} }) {
  const type = method ? method.toUpperCase() : data ? "POST" : "GET"
  const qs = data && type === "GET" ? `?${urlParamify(data)}` : ""
  const url = `${serverURL}/${action.replace(/^\//, "")}${qs}`
  return request(url, {
    method: type,
    headers: {
      "Content-Type": "application/json"
    },
    ...options,
    ...(data && type !== "GET" && { body: JSON.stringify(data) })
  })
}
