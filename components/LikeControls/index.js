import React from "react"
import classNames from "classnames"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "./style.css"

export default function LikeControls({ liked, setLiked }) {
  return (
    <div className="likeControls">
      <button
        className={classNames({ active: liked === false })}
        onClick={() => setLiked(false)}
      >
        <FontAwesomeIcon icon="thumbs-down" />
      </button>
      <button
        className={classNames({ active: liked })}
        onClick={() => setLiked(true)}
      >
        <FontAwesomeIcon icon="thumbs-up" />
      </button>
    </div>
  )
}
