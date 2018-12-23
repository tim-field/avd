import React from "react"

export default function Control({ label, min, max, setMin, setMax }) {
  return (
    <fieldset>
      <legend>{label}</legend>
      <div>
        <label>Min {min}</label>
        <input
          min={0}
          max={11}
          value={min}
          onChange={({ target: { value } }) => setMin(value)}
          type="range"
        />
        <label>Max {max}</label>
        <input
          min={0}
          max={11}
          value={max}
          onChange={({ target: { value } }) => setMax(value)}
          type="range"
        />
      </div>
    </fieldset>
  )
}
