import React from "react"

function minMaxLabel(min, max) {
  if (min && max && min !== max) {
    return `${min} to ${max}`
  }
  if (max || min) {
    return `${Math.max(max, min)}`
  }
  return ""
}

export default function Control({ label, min, max, setMin, setMax }) {
  return (
    <fieldset>
      <legend>
        {label} {minMaxLabel(min, max)}
      </legend>
      <div>
        <label>Min </label>
        <input
          min={0}
          max={11}
          value={min}
          onChange={({ target: { value } }) => setMin(value)}
          type="range"
        />
        <label>Max </label>
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
