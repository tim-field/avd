import React, { useEffect, useState, Fragment, useRef } from "react"
// import Controls from "../Controls"
import debounce from "lodash.debounce"
import Control from "../Control"
// import request from "../../utils/request"
import api from "../../utils/api"
import "./style.css"
import PlayControls from "../PlayControls"
import LikeControls from "../LikeControls"

const saveAVD = debounce(data => {
  return api({ action: "avd/", data })
}, 300)

function saveLiked(userId, trackId, isLiked) {
  return api({ action: "avd/like", data: { userId, trackId, liked: isLiked } })
}

function CurrentTrack({ spotifyService, userId, onChange }) {
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

  function changed() {
    if (onChange) {
      onChange({ trackId, arousal, valence, depth, liked })
    }
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
              arousal: res.arousal || res.avg_arousal,
              valence: res.valence || res.avg_valence,
              depth: res.depth || res.avg_depth
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
        changed()
      }
    },
    [trackId]
  )

  useEffect(
    () => {
      if (arousal || valence || depth) {
        saveAVD({ userId, trackId, arousal, valence, depth })
        changed()
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
              const v = isLiked === liked ? null : isLiked
              setLiked(v)
              saveLiked(userId, trackId, v).then(({ liked }) => setLiked(liked))
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
                setAVD({ valence, depth, arousal: Number(value) })
              }
            />
            <Control
              id="valence"
              label="Valence"
              startLabel="Melancholy"
              endLabel="Positive"
              value={valence}
              onChange={({ target: { value } }) =>
                setAVD({ valence: Number(value), depth, arousal })
              }
            />
            <Control
              id="depth"
              label="Depth"
              startLabel="Accessible"
              endLabel="Challenging"
              value={depth}
              onChange={({ target: { value } }) =>
                setAVD({ valence, depth: Number(value), arousal })
              }
            />
          </div>
        )}
      </div>
    </Fragment>
  ) : null
}

export default CurrentTrack
