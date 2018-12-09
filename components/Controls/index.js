import React, { useState, useEffect } from "react"
import debounce from "lodash.debounce"
import Control from "../Control"
import request from "../../utils/request"
import "./style.css"

const HOST = process.env.HOST
const PORT = process.env.PORT

const serverURL = `${HOST}:${PORT}` // TODO

const save = debounce(data => {
  return request(`${serverURL}/avd`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
}, 300)

function Controls({
  userId,
  trackId,
  arousal,
  valence,
  depth,
  setArousal,
  setValence,
  setDepth
}) {
  // const [arousal, setArousal] = useState(0)
  // const [valence, setValence] = useState(0)
  // const [depth, setDepth] = useState(0)

  useEffect(
    () => {
      if (arousal || valence || depth) {
        save({ userId, trackId, arousal, valence, depth })
      }
    },
    [[arousal, valence, depth].join(",")]
  )

  useEffect(
    () => {
      request(`${serverURL}/avd?userId=${userId}&trackId=${trackId}`).then(
        res => {
          setArousal(res.arousal || 0)
          setValence(res.valence || 0)
          setDepth(res.depth || 0)
        }
      )
      // document.title =
    },
    [trackId]
  )

  return (
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
  )
}

export default Controls
