import React, { useEffect, useContext, useState, Fragment, useRef } from "react"
import debounce from "lodash.debounce"
import Control from "../Control"
import api from "../../utils/api"
import PlayControls from "../PlayControls"
import LikeControls from "../LikeControls"
import Listeners from "../Listeners"
import Store from "../../store"
import { ColorExtractor } from "react-color-extractor"

import "./CurrentTrack.scss"

const saveAVD = debounce(data => {
  return api({ action: "avd/", data })
}, 300)

function saveLiked(userId, trackId, isLiked) {
  return api({ action: "avd/like", data: { userId, trackId, liked: isLiked } })
}

function CurrentTrack({ spotifyService, userId, arousal, valence, depth }) {
  const { dispatch } = useContext(Store)
  const [track, setTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [liked, setLiked] = useState(null)
  const timeoutRef = useRef()
  const trackId = track && track.id
  const [iamgeColors, setColors] = useState([])
  function setAVD(updates) {
    dispatch({
      valence,
      depth,
      arousal,
      ...updates,
      type: "set-avd"
    })
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null
  }
  function hexToHsl(hex, mode = "default") {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

    var r = parseInt(result[1], 16)
    var g = parseInt(result[2], 16)
    var b = parseInt(result[3], 16)

    ;(r /= 255), (g /= 255), (b /= 255)
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b)
    var h,
      s,
      l = (max + min) / 2

    if (max == min) {
      h = s = 0 // achromatic
    } else {
      var d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    s = s * 100
    s = Math.round(s)
    l = l * 100
    l = Math.round(l)
    h = Math.round(360 * h)

    var colorInHSL = "hsl(" + h + ", " + s + "%, " + l + "%)"
    let returnValue = colorInHSL
    switch (mode) {
      case "h":
        returnValue = h
        break
      case "s":
        returnValue = s
        break
      case "l":
        returnValue = l
        break
      default:
        returnValue = colorInHSL
    }
    return returnValue
  }
  function getColors(colors) {
    console.log("colors", colors)
    if (colors.length < 1) {
      console.log("no colors")
      return false
    }
    // console.log('colors[0]: ', hexToRgb(colors[0]));
    console.log("colors[0]: ", hexToHsl(colors[0]))
    console.log("colors[1]: ", hexToHsl(colors[1]))
    console.log("colors[2]: ", hexToHsl(colors[2]))
    console.log("colors[3]: ", hexToHsl(colors[3]))
    console.log("colors[4]: ", hexToHsl(colors[4]))
    console.log("colors[4]: ", hexToHsl(colors[5]))
    // this.setState(state => ({ colors: [...state.colors, ...colors] }))
    setColors(colors)
    const rootElement = document.getElementById("html")
    rootElement.setAttribute("data-theme", "generated")
    document.documentElement.style.setProperty("--backgroundColor", colors[0])
    document.documentElement.style.setProperty("--themeColor", colors[1])
    // document.documentElement.style.setProperty('--textColor', colors[2]);
    if (hexToHsl(colors[0], "l") < 50) {
      console.log("less than 50: ", hexToHsl(colors[0], "l"))
      document.documentElement.style.setProperty(
        "--textColor",
        "rgba(229,229,229,.9)"
      )
    } else {
      console.log("more than 50: ", hexToHsl(colors[0], "l"))
      document.documentElement.style.setProperty(
        "--textColor",
        "rgba(0,0,0,.9)"
      )
    }
    // document.documentElement.style.setProperty('--themeColor-weaker', colors[2]);
    document.documentElement.style.setProperty("--themeColor-weaker", colors[0])
    document.documentElement.style.setProperty(
      "--themeColor-stronger",
      colors[5]
    )

    document.documentElement.style.setProperty(
      "--themeColor-weakest",
      colors[3]
    )
    document.documentElement.style.setProperty(
      "--themeColor-strongest",
      colors[5]
    )
  }

  const doRequest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    return spotifyService({ action: "v1/me/player" })
      .then(spotifyTrack => {
        if (spotifyTrack.item) {
          const {
            item: {
              name,
              id,
              artists,
              album: { images }
            }
          } = spotifyTrack
          setTrack({
            name,
            id,
            artist: artists.map(({ name }) => name).join(", "),
            image: images.find(i => i.height === 300) || images[1],
            raw: spotifyTrack
          })
          setIsPlaying(spotifyTrack.is_playing)
        }
        timeoutRef.current = setTimeout(doRequest, 5000)
      })
      .catch(e => {
        console.error(e)
        timeoutRef.current = setTimeout(doRequest, 5000)
      })
  }

  useEffect(() => {
    doRequest()
    return () => clearTimeout(timeoutRef.current)
  }, [])

  useEffect(
    () => {
      if (track) {
        document.title = `AVD - ${track.name}`
        api({ action: `avd?userId=${userId}&trackId=${track.id}` }).then(
          res => {
            setAVD({
              arousal: res.arousal || 0,
              valence: res.valence || 0,
              depth: res.depth || 0
            })
            setLiked(res.liked)
          }
        )
        api({
          action: "track",
          data: {
            userId,
            trackId,
            track: track.raw
          }
        })
        dispatch({ type: "set-current-track-id", trackId })
      }
    },
    [trackId]
  )

  useEffect(
    () => {
      if (arousal || valence || depth) {
        saveAVD({ userId, trackId, arousal, valence, depth })
      }
    },
    [arousal, valence, depth]
  )

  return track ? (
    <Fragment>
      <h1>
        {track.name}
        <span>by {track.artist}</span>
      </h1>
      <div style={{ position: "fixed", bottom: "1rem" }}>
        {iamgeColors &&
          iamgeColors.map(color => {
            return (
              <div
                style={{
                  backgroundColor: color,
                  width: 30,
                  height: 30,
                  display: "inline-block",
                  border: "2px solid white",
                  borderRadius: "3px",
                  transform: "rotate(-90deg)"
                }}
              />
            )
          })}
      </div>
      <div className="CurrentTrack">
        <div className="player">
          <PlayControls
            isPlaying={isPlaying}
            onPrevious={() =>
              spotifyService({
                action: "v1/me/player/previous",
                method: "POST"
              }).then(() => doRequest())
            }
            onNext={() =>
              spotifyService({
                action: "v1/me/player/next",
                method: "POST"
              }).then(() => doRequest())
            }
            onPlay={() => {
              setIsPlaying(true)
              spotifyService({
                action: "v1/me/player/play",
                method: "PUT"
              }).then(() => doRequest())
            }}
            onPause={() => {
              setIsPlaying(false)
              clearTimeout(timeoutRef.current)
              spotifyService({ action: "v1/me/player/pause", method: "PUT" })
            }}
          />
          <div className="coverWrap">
            <ColorExtractor getColors={colors => getColors(colors)}>
              <img className="image" src={track.image.url} />
            </ColorExtractor>
            <div className="back">
              <div>
                <span className="title">track: </span>
                <span className="subtitle">{track.name}</span>
              </div>
              <div>
                <span className="title">artist: </span>
                <span className="subtitle">{track.artist}</span>
              </div>
              <div>
                <span className="title">
                  {track.raw.item.album && track.raw.item.album.album_type}:
                </span>
                <span className="subtitle">
                  {track.raw.item.album && track.raw.item.album.name}
                </span>
              </div>
              {track.raw.item.album &&
                track.raw.item.album.external_urls &&
                track.raw.item.album.external_urls.spotify && (
                  <div className="albumLinkWrap">
                    <a
                      target="_blank"
                      className="albumLink"
                      href={track.raw.item.album.external_urls.spotify}
                    >
                      View in Spotify
                    </a>
                  </div>
                )}
            </div>
          </div>
          <LikeControls
            liked={liked}
            setLiked={isLiked => {
              const v = isLiked === liked ? null : isLiked
              setLiked(v)
              saveLiked(userId, trackId, v).then(({ liked }) => setLiked(liked))
            }}
          />
        </div>
        {userId && (
          <Fragment>
            <div className="controls">
              <Control
                id="arousal"
                label="Arousal"
                startLabel="Chill"
                endLabel="Energetic"
                value={arousal}
                onChange={({ target: { value } }) =>
                  setAVD({
                    arousal: Number(value)
                  })
                }
              />
              <Control
                id="valence"
                label="Valence"
                startLabel="Melancholy"
                endLabel="Positive"
                value={valence}
                onChange={({ target: { value } }) =>
                  setAVD({
                    valence: Number(value)
                  })
                }
              />
              <Control
                id="depth"
                label="Depth"
                startLabel="Accessible"
                endLabel="Challenging"
                value={depth}
                onChange={({ target: { value } }) =>
                  setAVD({
                    depth: Number(value)
                  })
                }
              />
            </div>
            <Listeners trackId={trackId} userId={userId} />
          </Fragment>
        )}
      </div>
    </Fragment>
  ) : null
}

export default CurrentTrack
