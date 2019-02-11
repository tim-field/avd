import React from "react"
import "./Control.scss"

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
      <legend>{label}</legend>
      <div className="inputNumberWrap">
        <input
          type="number"
          value={value}
          // id={id}
          min={min}
          max={max}
          onChange={onChange}
        />
      </div>
      <div className="inputRangeWrap">
        {endLabel && (
          <label className="endLabel" htmlFor={id}>
            {endLabel}
          </label>
        )}
        <input
          type="range"
          value={value}
          // orient="vertical"
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
      </div>
      {description && <p>{description}</p>}
    </fieldset>
  )
}

export default Control
