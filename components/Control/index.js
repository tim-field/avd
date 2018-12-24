import React from "react"
import "./style.css"

function Control({
  value,
  id,
  label,
  startLabel,
  endLabel,
  onChange,
  description,
  min = 1,
  max = 11
}) {
  return (
    <fieldset className="control">
      <legend>
        {label} {value}
      </legend>
      {endLabel && (
        <label className="endLabel" htmlFor={id}>
          {endLabel}
        </label>
      )}
      <input
        type="range"
        value={value}
        orient="vertical"
        onChange={onChange}
        id={id}
        min={min}
        max={max}
      />
      {startLabel && (
        <label className="startLabel" htmlFor={id}>
          {startLabel}
        </label>
      )}
      {description && <p>{description}</p>}
    </fieldset>
  )
}

export default Control
