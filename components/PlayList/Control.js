import React from "react"

function minMaxLabel(min, max) {
  console.log(min, max)
  if (min === 0 || max === 0) {
    return ""
  }
  if (min !== max) {
    return `${min} to ${max}`
  }
  return `${min}`
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
