import React, { useState, useContext, useRef } from "react"
import Store from "../../../store"
import DragginChart from "../DragginChart"
import { getGraphTracks } from "../../../actions"

// function HoverComponent({ isDragging, dataPoint: { id, x, y } }) {
//   return (
//     <div className={cx("point-description", { isDragging })}>
//       <h4 className="point-description-header">{`ID: ${id}`}</h4>
//       <span className="point-description-content">
//         {`the X value for this point is ${Math.round(x * 10000) / 100}%`}
//         <br />
//         {`the Y value for this point is ${Math.round(y * 10000) / 100}%`}
//       </span>
//     </div>
//   )
// }

// function reducer(state, action) {
//   switch (action.type) {
//     case "set-series":
//       return {
//         ...state,
//         [action.series]: action.updatedCoords
//       }
//   }
// }

const withIds = (name, arr) =>
  arr.map(({ x, y }, i) => ({ x, y, id: `${name}_${i}` }))

const seriesState = {
  arousal: withIds("arousal", [
    { x: 1, y: 5 },
    { x: 15, y: 5 },
    { x: 30, y: 5 }
  ]),
  valence: withIds("valence", [
    { x: 1, y: 6 },
    { x: 15, y: 6 },
    { x: 30, y: 6 }
  ]),
  depth: withIds("depth", [{ x: 1, y: 7 }, { x: 15, y: 7 }, { x: 30, y: 7 }])
}

const yDomain = [1, 11]
const xDomain = [1, 30]

const getQueryData = seriesData => {
  return Object.entries(seriesData).reduce(
    (res, [series, data]) => ({
      ...res,
      [series]: data.map(({ y }) => y)
    }),
    {}
  )
}

const Graph = () => {
  const [seriesData, setSeriesData] = useState(seriesState)
  const { dispatch } = useContext(Store)
  const getTracksTimeout = useRef()

  const onPointDrag = (updatedCoords, series) => {
    const updatedSeriesData = {
      ...seriesData,
      [series]: updatedCoords
    }
    setSeriesData(updatedSeriesData)
    getTracksDebounced(updatedSeriesData)
  }

  const getTracksDebounced = (data, wait = 400) => {
    clearTimeout(getTracksTimeout.current)
    getTracksTimeout.current = setTimeout(() => {
      const queryData = getQueryData(data)
      dispatch({ type: "set-track-query", query: { series: queryData } })
      dispatch(getGraphTracks({ series: queryData }))
    }, wait)
  }

  return (
    <div>
      <DragginChart
        onPointDrag={onPointDrag}
        // hoverComponent={HoverComponent}
        seriesData={seriesData}
        width={300}
        height={300}
        yDomain={yDomain}
        xDomain={xDomain}
      />
    </div>
  )
}

export default Graph
