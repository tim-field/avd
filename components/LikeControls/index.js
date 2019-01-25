import React from "react"
import classNames from "classnames"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "./style.css"
import "./LikeControls.scss"

// import styles from "./LikeControls.module.scss"
// note to use css modules, it would be {styles.LikeControls} (note uppercase L)

export default function LikeControls({ liked, setLiked }) {
  return (
    <div className={classNames('likeControls')}>
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
