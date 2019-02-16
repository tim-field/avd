import React from "react"
import { lensPath, view } from "ramda"
import { userType } from "../../utils/propTypes"
import "./UserImage.scss"

const imagePath = lensPath(["images", 0, "url"])

function UserImage({ user }) {
  const url = view(imagePath, user) || "https://via.placeholder.com/50"
  return (
    <div className="avatar">
      <img
        src={url}
        title={user.display_name}
        // style={{ height: 50 }}
        alt={user.display_name}
      />
    </div>
  )
}

UserImage.propTypes = {
  user: userType
}

export default UserImage
