import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function PlayControls({
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious
}) {
  return (
    <div className="playControls">
      <button onClick={onPrevious}>
        <FontAwesomeIcon icon="step-backward" />
      </button>
      {isPlaying && (
        <button onClick={onPause}>
          <FontAwesomeIcon icon="pause" />
        </button>
      )}
      {!isPlaying && (
        <button onClick={onPlay}>
          <FontAwesomeIcon icon="play" />
        </button>
      )}
      <button onClick={onNext}>
        <FontAwesomeIcon icon="step-forward" />
      </button>
    </div>
  )
}
