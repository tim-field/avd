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
  const [{ arousal, valence, depth }, setAVD] = useState({
    arousal: 0,
    valence: 0,
    depth: 0
  })
  const [track, setTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [liked, setLiked] = useState(null)
  const timeoutRef = useRef()
  const trackId = track && track.id

  const doRequest = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    return spotifyService({ action: "v1/me/player" }).then(spotifyTrack => {
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
          ({ liked, arousal = 0, valence = 0, depth = 0 }) => {
            setAVD({ arousal, valence, depth })
            setLiked(liked)
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
    [arousal, valence, depth]
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
              startLabel="Chill"
              endLabel="Energetic"
              value={arousal}
              onChange={({ target: { value } }) =>
                setAVD({ valence, depth, arousal: value })
              }
            />
            <Control
              id="valence"
              label="Valence"
              startLabel="Melancholy"
              endLabel="Positive"
              value={valence}
              onChange={({ target: { value } }) =>
                setAVD({ valence: value, depth, arousal })
              }
            />
            <Control
              id="depth"
              label="Depth"
              startLabel="Accessible"
              endLabel="Challenging"
              value={depth}
              onChange={({ target: { value } }) =>
                setAVD({ valence, depth: value, arousal })
              }
            />
          </div>
        )}
      </div>
    </Fragment>
  ) : null
}

export default CurrentTrack
