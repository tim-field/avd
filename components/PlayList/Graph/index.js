import React, { useState, useContext, useRef } from "react"
import { findIndex, propEq, update } from "ramda"
import {
  FlexibleXYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  DiscreteColorLegend
} from "react-vis"
import Store, { connect } from "../../../store"
import LineMarkSeries from "./LineMarkSeries"
import { getGraphTracks } from "../../../actions"
import "./Graph.scss"

const withIds = (name, arr) =>
  arr.map(({ x, y }, i) => ({ x, y, id: `${name}_${i}` }))

const seriesState = {
  arousal: withIds("arousal", [
    { x: 1, y: 5 },
    { x: 15, y: 5 },
    { x: 30, y: 5 }
  ]),
  valence: withIds("valence", [
    { x: 1, y: 5 },
    { x: 15, y: 5 },
    { x: 30, y: 5 }
  ]),
  depth: withIds("depth", [{ x: 1, y: 5 }, { x: 15, y: 5 }, { x: 30, y: 5 }])
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

const Graph = ({ colors }) => {
  const [seriesData, setSeriesData] = useState(seriesState)
  const { dispatch } = useContext(Store)
  const getTracksTimeout = useRef()

  const onValueDrag = series => (oldVal, { chartCoords }) => {
    const data = seriesData[series]
    const index = findIndex(propEq("id", oldVal.id))(data)
    if (index > -1) {
      // const newData = update(index, { ...oldVal, ...chartCoords }, data)
      const newData = update(index, { ...oldVal, y: chartCoords.y }, data) // prevent x axis moving
      const updatedSeriesData = {
        ...seriesData,
        [series]: newData
      }
      setSeriesData(updatedSeriesData)
      getTracksDebounced(updatedSeriesData)
    }
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
    <div className="__draggin-chart-container">
      <FlexibleXYPlot
        animation
        dontCheckIfEmpty
        xDomain={xDomain}
        yDomain={yDomain}
        width={300}
        height={300}
        // colorType="linear"
        // colorDomain={[0, 3]}
        // colorRange={[colors.weaker, colors.stronger]}
      >
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis />
        <DiscreteColorLegend
          orientation="horizontal"
          items={[
            // set mapStateToProps function below for where these come from
            { title: "arousal", color: colors[0] },
            { title: "valence", color: colors[1] },
            { title: "depth", color: colors[2] }
          ]}
        />
        {Object.entries(seriesData).map(([series, data], idx) => {
          return (
            <LineMarkSeries
              key={series}
              color={colors[idx]}
              data={data}
              curve={"curveMonotoneX"}
              onValueDrag={onValueDrag(series)}
              animation={false}
            />
          )
        })}
      </FlexibleXYPlot>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    colors: [state.colors.stronger, state.colors.text, state.colors.weaker]
  }
}

export default connect({ mapStateToProps })(Graph)
