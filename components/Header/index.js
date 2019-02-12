import React, { useState } from "react"
import "./Header.scss"
import classNames from "classnames"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import domtoimage from "dom-to-image"

import Logo from "./Logo"
import PlayListSelector from "../PlayListSelector"

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
  const [favIcon, setFavIcon] = useState("")
  // console.log('doLogout', doLogout)
  function svg2Image(element = "generatedLogo") {
    if (!element) {
      return false
    }
    const theDom = document.getElementById(element)
    const image = domtoimage.toJpeg(theDom, { quality: 1 }).then(dataUrl => {
      // console.log('dataUrl:', dataUrl)
      setFavIcon(dataUrl)
      return dataUrl
    })
    return "data:image/svg+xml;base64," + image
  }

  return (
    <div className="Header">
      <div className="appTitle">
        <span>A / V / D</span>
        <div className="logoWrap">
          <Logo
            fill="blue"
            arousal={arousal}
            valence={valence}
            depth={depth}
            favIcon={favIcon}
            generateImage={false}
            svg2Image={svg2Image}
          />
        </div>
      </div>
      <div className="about">
        <section>
          <h2>What is This?</h2>
          <p>
            AVD is a community driven playlist generator based on attributes of
            music, rather than genre.
          </p>
          <h2>Playlists</h2>
          <p>Create a playlist by filtering the attributes you want.</p>
          <p>
            Alternatively, once a track is rated you can generate a playist of
            similar tracks.
          </p>
          <h2>Rating Tracks</h2>
          <p>
            While a track is playing, change the sliders to rate your opinion.
          </p>
          <h3>Arousal</h3>
          <p>how energetic a track is.</p>
          <h3>Valence</h3>
          <p>The mood of a track.</p>
          <h3>Depth</h3>
          <p>How much effort the track requires from the listener.</p>
          <h3>Task, Personality, Mood</h3>
        </section>
      </div>
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

      <div className="appUser">
        <PlayListSelector displayMode="compressed" />

        {/* <button className="playlistTrigger">
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
        </button> */}
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
