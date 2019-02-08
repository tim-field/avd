import React, { useState } from "react"
import {
  XYPlot,
  HorizontalGridLines,
  LineSeries,
  XAxis,
  YAxis
} from "react-vis"

const Graph = () => {
  const [arousalSeries, setA] = useState([
    { x: 1, y: 5 },
    { x: 15, y: 5 },
    { x: 30, y: 5 }
  ])
  const [valenceSeries, setV] = useState([
    { x: 1, y: 6 },
    { x: 15, y: 5 },
    { x: 30, y: 6 }
  ])
  const [depthSeries, setD] = useState([
    { x: 1, y: 7 },
    { x: 15, y: 5 },
    { x: 30, y: 7 }
  ])

  return (
    <div>
      <XYPlot width={300} height={300}>
        <HorizontalGridLines />
        <LineSeries
          onSeriesClick={console.log}
          onNearestXY={(datapoint, event) => console.log(datapoint)}
          data={arousalSeries}
        />
        <LineSeries data={valenceSeries} />
        <LineSeries data={depthSeries} />
        <XAxis />
        <YAxis />
      </XYPlot>
    </div>
  )
}

export default Graph
