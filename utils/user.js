import React from "react"
import { lensPath, view } from "ramda"

const imagePath = lensPath(["images", 0, "url"])

export function getImage(user) {
  const url = view(imagePath, user) || "https://via.placeholder.com/50"
  return (
    <img
      src={url}
      title={user.display_name}
      style={{ height: 50 }}
      alt={user.display_name}
    />
  )
}
