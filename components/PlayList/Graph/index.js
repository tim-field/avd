import React, { useState } from "react"
// import {
//   XYPlot,
//   HorizontalGridLines,
//   VerticalGridLines,
//   LineSeries,
//   XAxis,
//   YAxis,
//   MarkSeries
// } from "react-vis"
import DragginChart from "../DragginChart"

function HoverComponent({ isDragging, dataPoint: { id, x, y } }) {
  return (
    <div className={cx("point-description", { isDragging })}>
      <h4 className="point-description-header">{`ID: ${id}`}</h4>
      <span className="point-description-content">
        {`the X value for this point is ${Math.round(x * 10000) / 100}%`}
        <br />
        {`the Y value for this point is ${Math.round(y * 10000) / 100}%`}
      </span>
    </div>
  )
}

const Graph = () => {
  const [arousalSeries, setA] = useState([
    { x: 1, y: 5, id: "a1" },
    { x: 15, y: 5, id: "a2" },
    { x: 30, y: 5, id: "a3" }
  ])

  console.log("render", arousalSeries)

  const onPointDrag = updatedCoords => {
    console.log(updatedCoords)
    setA(updatedCoords)
  }

  // const [valenceSeries, setV] = useState([
  //   { x: 1, y: 6 },
  //   { x: 15, y: 6 },
  //   { x: 30, y: 6 }
  // ])
  // const [depthSeries, setD] = useState([
  //   { x: 1, y: 1 },
  //   { x: 15, y: 4 },
  //   { x: 30, y: 9 }
  // ])

  return (
    <div>
      <DragginChart
        onPointDrag={onPointDrag}
        hoverComponent={HoverComponent}
        data={arousalSeries}
        width={300}
        height={300}
        yDomain={[1, 11]}
        xDomain={[1, 30]}
      />
      {/*<XYPlot
        width={300}
        height={300}
        yDomain={[0, 11]}
        xDomain={[1, 30]}
        onMouseUp={console.log}
      >
        <LineSeries onSeriesClick={console.log} data={arousalSeries} />
        <LineSeries data={valenceSeries} />
        <LineSeries data={depthSeries} />
        <MarkSeries
          data={arousalSeries}
          onValueClick={console.log}
          onValueMouseOut={console.log}
          stroke="white"
        />
        <MarkSeries data={valenceSeries} draggable stroke="white" />
        <MarkSeries data={depthSeries} drag stroke="white" />
        <HorizontalGridLines
          onSeriesClick={console.log}
          onValueClick={console.log}
        />
        <VerticalGridLines
          onSeriesClick={console.log}
          onValueClick={console.log}
        />
        <XAxis />
        <YAxis />
      </XYPlot>*/}
    </div>
  )
}

export default Graph
