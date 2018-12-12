import React, { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import api from "../../utils/api"

export default function PlayList({ spotifyService }) {
  const [{ arousal, valence, depth, fuzz }, setAVD] = useState({
    arousal: 0,
    valence: 0,
    depth: 0,
    fuzz: 1
  })
  const [tracks, setTracks] = useState([])

  useEffect(
    () => {
      if (arousal || valence || depth) {
        api({
          action: `tracks?arousal=${arousal}&valence=${valence}&depth=${depth}&fuzz=${fuzz}`
        }).then(tracks => {
          setTracks(tracks)
        })
      }
    },
    [arousal, valence, depth, fuzz]
  )

  return (
    <div className="playlist">
      <div className="searchControls">
        <label>
          Arousal
          <input
            type="input"
            min={0}
            max={11}
            value={arousal}
            onChange={({ target: { value } }) =>
              setAVD({ arousal: value, valence, depth, fuzz })
            }
            type="number"
          />
        </label>
        <label>
          Valence
          <input
            type="input"
            min={0}
            max={11}
            value={valence}
            type="number"
            onChange={({ target: { value } }) =>
              setAVD({ valence: value, arousal, depth, fuzz })
            }
          />
        </label>
        <label>
          Depth
          <input
            type="input"
            min={0}
            max={11}
            value={depth}
            type="number"
            onChange={({ target: { value } }) =>
              setAVD({ depth: value, arousal, valence, fuzz })
            }
          />
        </label>
        <label>
          Fuzz
          <input
            type="input"
            min={0}
            max={3}
            value={fuzz}
            type="number"
            onChange={({ target: { value } }) =>
              setAVD({ fuzz: value, depth, arousal, valence })
            }
          />
        </label>
        <button>
          <FontAwesomeIcon icon="search" />
        </button>
      </div>
      <div className="playlistTracks">
        {tracks.map(track => {
          return (
            <div key={track.id} className="playlistTrack">
              <div>{track.name}</div>
              <div>{track.artist}</div>
              <div />
            </div>
          )
        })}
      </div>
    </div>
  )
}
