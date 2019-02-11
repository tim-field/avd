import React, { useState } from "react"
import classNames from "classnames"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "./PlayListSelector.scss"
import Loading from "../Loading"

function PlayListSelector({
  loading,
  activePlayList,
  displayMode = "collapsed", // 'collapsed', 'expanded'
  playlists,
  onSelectPlayList,
  onSelectCreatePlayList
}) {
  const [isActive, setIsActive] = useState(false)
  return (
    <div
      className={classNames(
        "PlayListSelector",
        displayMode,
        isActive ? "isActive" : ""
      )}
    >
      <button
        className={classNames("playlistTrigger", isActive ? "isActive" : "")}
        onClick={() => setIsActive(true)}
        onMouseOver={() => setIsActive(true)}
        onMouseOut={() => setIsActive(false)}
      >
        <FontAwesomeIcon icon="list" />
        <FontAwesomeIcon icon="play" />
        <div className="playlistText">
          <span>
            {loading ? <Loading text="Loading Playlists" /> : "Select playlist"}
          </span>
          <FontAwesomeIcon icon="caret-down" />
        </div>
        <div className="playlistItems">
          <div className="triangle">
            <FontAwesomeIcon icon="caret-up" size="2x" />
          </div>
          {playlists &&
            playlists.map(playlist => {
              return (
                <div
                  key={playlist.id}
                  className="playlistItem"
                  onClick={() => {
                    setIsActive(false)
                    onSelectPlayList(playlist.id)
                  }}
                >
                  {playlist.name}
                </div>
              )
            })}
          <div
            className="playlistItem new"
            onClick={() => {
              setIsActive(false)
              onSelectCreatePlayList()
            }}
          >
            + New Playlist
          </div>
        </div>
      </button>
    </div>
  )
}

export default PlayListSelector
