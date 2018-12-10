import React, { useEffect, useState, Fragment, useRef } from "react"
// import Controls from "../Controls"
import debounce from "lodash.debounce"
import Control from "../Control"
// import request from "../../utils/request"
import api from "../../utils/api"
import "./style.css"
import PlayControls from "../PlayControls"
import LikeControls from "../LikeControls"

const HOST = process.env.HOST
const PORT = process.env.PORT

// const serverURL = `${HOST}:${PORT}` // TODO

const saveAVD = debounce(data => {
  return api({ action: "avd/", data })
}, 300)

function saveLiked(userId, trackId, isLiked) {
  return api({ action: "avd/like", data: { userId, trackId, liked: isLiked } })
}

function CurrentTrack({ spotifyService, userId }) {
  const [track, setTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [arousal, setArousal] = useState(0)
  const [valence, setValence] = useState(0)
  const [depth, setDepth] = useState(0)
  const [liked, setLiked] = useState(null)
  const timeoutRef = useRef()
  const trackId = track && track.id

  const doRequest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    return spotifyService("v1/me/player").then(spotifyTrack => {
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
        timeoutRef.current = setTimeout(doRequest, 5000)
      }
    })
  }

  useEffect(() => {
    doRequest()
  }, [])

  useEffect(
    () => {
      if (track) {
        console.log("track changed")
        document.title = `AVD - ${track.name}`
        api({ action: `avd?userId=${userId}&trackId=${track.id}` }).then(
          res => {
            console.log(res)
            setArousal(res.arousal || 0)
            setValence(res.valence || 0)
            setDepth(res.depth || 0)
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
    [[arousal, valence, depth].join(",")]
  )

  return !!track ? (
    <Fragment>
      <h1>
        {track.name} by {track.artist}
      </h1>
      <div className="currentTrack">
        <div className="player">
          <PlayControls
            isPlaying={isPlaying}
            onPrevious={() =>
              spotifyService("v1/me/player/previous", "POST").then(() =>
                doRequest()
              )
            }
            onNext={() =>
              spotifyService("v1/me/player/next", "POST").then(() =>
                doRequest()
              )
            }
            onPlay={() => {
              setIsPlaying(true)
              spotifyService("v1/me/player/play", "PUT").then(() => doRequest())
            }}
            onPause={() => {
              setIsPlaying(false)
              clearTimeout(timeoutRef.current)
              spotifyService("v1/me/player/pause", "PUT")
            }}
          />
          <img className="image" src={track.image.url} />
          <LikeControls
            liked={liked}
            setLiked={isLiked => {
              setLiked(isLiked)
              saveLiked(userId, trackId, isLiked).then(({ liked }) =>
                setLiked(liked)
              )
            }}
          />
        </div>
        {userId && (
          <div className="controls">
            <Control
              id="arousal"
              label="Arousal"
              startLabel="Low"
              endLabel="High"
              value={arousal}
              onChange={({ target: { value } }) => setArousal(value)}
            />
            <Control
              id="valence"
              label="Valence"
              startLabel="Negative"
              endLabel="Positive"
              value={valence}
              onChange={({ target: { value } }) => setValence(value)}
            />
            <Control
              id="depth"
              label="Depth"
              startLabel="Basic"
              endLabel="Intellectual"
              value={depth}
              onChange={({ target: { value } }) => setDepth(value)}
            />
          </div>
        )}
      </div>
    </Fragment>
  ) : (
    <p>Loading</p>
  )
}

export default CurrentTrack
