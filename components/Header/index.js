import React from "react"
import "./Header.scss"
import classNames from "classnames"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Logo from "./Logo"

function Header({
  user,
  doLogout,
  toggleUI,
  setDisplayMode,
  setFullScreen,
  arousal,
  valence,
  depth
}) {
  // console.log('doLogout', doLogout)
  return (
    <div className="Header">
      <div className="appTitle">
        <span>A / V / D</span>
        <div className="logoWrap">
          <Logo fill="blue" arousal={arousal} valence={valence} depth={depth} />
        </div>
      </div>
      <div className="appUser">
        <div className="uiToggle">
          UI mode
          <div className="uiControls">
            <div className="themePanel">
              <div className={classNames("swatchSet", "light")}>
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
              </div>
              <button onClick={() => toggleUI("light")}>light</button>
            </div>
            <div className="themePanel">
              <div className={classNames("swatchSet", "dark")}>
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
              </div>
              <button onClick={() => toggleUI("dark")}>dark</button>
            </div>
            <div className="themePanel">
              <div className={classNames("swatchSet", "generated")}>
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
              </div>
              <button onClick={() => toggleUI("generated")}>generated</button>
            </div>
            <div className="modesWrap">
              <h4>Mode</h4>
              <button onClick={() => setDisplayMode("large")}>large</button>
              <button onClick={() => setDisplayMode("condensed")}>
                condensed
              </button>
              <button
                onClick={() => {
                  setDisplayMode("full")
                  setFullScreen(true)
                }}
              >
                Full screen
              </button>
            </div>
          </div>
          <div
            className="exitFullScreen"
            onClick={() => {
              setFullScreen(false)
              setDisplayMode("large")
            }}
          >
            <FontAwesomeIcon icon="compress-arrows-alt" />
          </div>
        </div>
        <button className="playlistTrigger">
          <FontAwesomeIcon icon="list" />
          <FontAwesomeIcon icon="play" />
          <div className="playlistText">
            <span>Select playlist</span>
            <FontAwesomeIcon icon="caret-down" />
          </div>
          <div className="playlistItems">
            <div className="triangle">
              <FontAwesomeIcon icon="caret-up" size="2x" />
            </div>
            <div
              className="playlistItem"
              onClick={() => console.log("TODO: hook up the playlist trigger")}
            >
              Chill and Positive
            </div>
            <div
              className="playlistItem"
              onClick={() => console.log("TODO: hook up the playlist trigger")}
            >
              Upbeat Vibes
            </div>
            <div
              className="playlistItem"
              onClick={() => console.log("TODO: hook up the playlist trigger")}
            >
              Melancholy & Weird
            </div>
            <div
              className="playlistItem new"
              onClick={() => console.log("TODO: hook up the playlist trigger")}
            >
              + New Playlist
            </div>
          </div>
        </button>
        <button className="logout" onClick={doLogout}>
          Logout
        </button>
      </div>
      <div className="bubbleWrap">
        <div className="bubble" />
        <div className="bubble" />
        <div className="bubble" />
      </div>
    </div>
  )
}

export default Header
