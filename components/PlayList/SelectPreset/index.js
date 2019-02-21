import React from "react"
import propTypes from "prop-types"
import { connect } from "../../../store.js"
import { presetType } from "../../../utils/propTypes"
import { applyPreset } from "../../../actions/index.js"

const SelectPreset = ({ preset, presets, setPreset }) => {
  return (
    <select onChange={setPreset} value={preset}>
      <option>Preset</option>
      {presets.map(p => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  )
}

SelectPreset.propTypes = {
  preset: propTypes.string,
  presets: propTypes.arrayOf(presetType),
  setPreset: propTypes.func.isRequired
}

const mapStateToProps = ({ preset, presets }) => ({ preset, presets })
const mapDispatchToProps = (dispatch, { presets }) => ({
  setPreset: ({ target: { value } }) => {
    const preset = presets.find(({ id }) => id === value)
    if (preset) {
      dispatch(applyPreset(preset))
    }
  }
})

export default connect({ mapStateToProps, mapDispatchToProps })(SelectPreset)
