import React, { useEffect, useContext, useState, Fragment, useRef } from "react"
import propTypes from "prop-types"
import { ColorExtractor } from "react-color-extractor"
import Control from "../Control"
import api from "../../utils/api"
import PlayControls from "../PlayControls"
import LikeControls from "../LikeControls"
import Listeners from "../Listeners"
import Store from "../../store"

import "./CurrentTrack.scss"
import { setColors, setCurrentTrack, loadListeners } from "../../actions"
import spotifyService from "../../spotify"
import { trackType } from "../../utils/propTypes"

function saveLiked(userId, trackId, isLiked) {
  return api({ action: "avd/like", data: { userId, trackId, liked: isLiked } })
}

function CurrentTrack({ track, userId, arousal, valence, depth }) {
  const { dispatch } = useContext(Store)
  const [isPlaying, setIsPlaying] = useState(false)
  const [liked, setLiked] = useState(null)
  const timeoutRef = useRef()
  const debounceSaveRef = useRef()
  const trackId = track && track.id

  const setAVD = (updates = {}) => {
    const data = {
      valence,
      depth,
      arousal,
      ...updates
    }
    dispatch({
      ...data,
      type: "set-avd"
    })

    clearTimeout(debounceSaveRef.current)
    debounceSaveRef.current = setTimeout(() => {
      api({
        action: "avd/",
        method: "POST",
        data: {
          ...data,
          userId,
          trackId
        }
      })
      dispatch(loadListeners(trackId))
    }, 400)
  }

  const doRequest = () => {
    clearTimeout(timeoutRef.current)
    return spotifyService({ action: "v1/me/player" })
      .then(spotifyTrack => {
        if (spotifyTrack.item) {
          dispatch(setCurrentTrack(spotifyTrack))
          setIsPlaying(spotifyTrack.is_playing)
        }
        // todo use track length here
        timeoutRef.current = setTimeout(doRequest, 5000)
      })
      .catch(e => {
        console.error(e)
        timeoutRef.current = setTimeout(doRequest, 5000)
      })
  }

  useEffect(() => {
    if (track) {
      document.title = `AVD - ${track.name}`
      api({
        action: "avd",
        method: "GET",
        data: {
          userId,
          trackId: track.id
        }
      }).then(res => {
        setAVD({
          arousal: res.arousal || 0,
          valence: res.valence || 0,
          depth: res.depth || 0
        })
        setLiked(res.liked)
      })
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
  }, [trackId, userId])

  useEffect(() => {
    doRequest()
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return track ? (
    <Fragment>
      <h1>
        {track.name}
        <span>by {track.artist}</span>
      </h1>
      {/* 
        // progress bar idea
      <div className="progress">
        <div className="bar" id="progressBar"/>
      </div>
      */}
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
            <ColorExtractor getColors={colors => dispatch(setColors(colors))}>
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
        {1 === 1 && (
          <div className="title">
            <h1>
              {track.name}
              <span>by {track.artist}</span>
            </h1>
          </div>
        )}
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
  ) : (
    <div className="CurrentTrack noData">
      <div className="player">no track</div>
      <div className="controls">
        Play a song in Spotify, or select a playlist
      </div>
    </div>
  )
}

CurrentTrack.propTypes = {
  track: trackType,
  userId: propTypes.string.isRequired,
  arousal: propTypes.number,
  valence: propTypes.number,
  depth: propTypes.number
}

export default CurrentTrack
