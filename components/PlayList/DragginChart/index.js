import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import memoize from "lodash.memoize"

import {
  // XYPlot,
  FlexibleXYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  // Hint,
  XAxis,
  YAxis
} from "react-vis"

import LineMarkSeries from "./libMod/LineMarkSeries"
// import MarkSeries from "./libMod/MarkSeries"
import { passiveCaptureEventObj } from "./utils"

import "./style.css"
import { findIndex, propEq, update } from "ramda"

const defaultsObj = {
  pointStyle: {
    fill: "lightblue"
  },
  lineStyle: {
    stroke: "blue",
    fill: "transparent",
    strokeWidth: 3
  },
  margin: {
    top: 15,
    bottom: 15,
    right: 20,
    left: 20
  }
}

export default class DragginChart extends PureComponent {
  static propTypes = {
    onPointDrag: PropTypes.func.isRequired,
    xDomain: PropTypes.array.isRequired,
    yDomain: PropTypes.array.isRequired,
    data: PropTypes.array,
    noDataText: PropTypes.string,
    pointSize: PropTypes.number,
    activePointSize: PropTypes.number,
    pointStyle: PropTypes.object,
    activePointStyle: PropTypes.object,
    lineStyle: PropTypes.object,
    margin: PropTypes.object,
    horizontalGridLines: PropTypes.bool,
    verticalGridLines: PropTypes.bool
  }

  static defaultProps = {
    series: [],
    noDataText: "No Data",
    pointSize: 5,
    activePointSize: 7,
    horizontalGridLines: false,
    verticalGridLines: false,
    ...defaultsObj
  }

  constructor(props) {
    super(props)

    this.state = {
      activeIndex: -1,
      isDragging: false,
      hidingActiveDataPoint: false
    }
    // this.updateIndexCache()
    // this.updateDomain()

    // if (process.env.NODE_ENV !== "production") {
    //   this.__componentDidMount = () => {
    //     const { data = [] } = this.props
    //     if (data) {
    //       const dataLength = data.length
    //       const uniqueIdSize = new Set(data.map(({ id }) => id)).size
    //       if (dataLength !== uniqueIdSize) {
    //         console.error("points given: ", this.props.data)
    //         throw new Error(
    //           "must provide an array of objects with properties { x, y, id } must have a unique ID for each data point object"
    //         )
    //       }
    //     }
    //   }
    // }
  }

  componentDidMount() {
    // if (process.env.NODE_ENV !== "production") {
    //   this.__componentDidMount()
    // }

    window.addEventListener(
      "mousedown",
      this.handleMouseDown,
      passiveCaptureEventObj
    )
    window.addEventListener(
      "mouseup",
      this.handleMouseUp,
      passiveCaptureEventObj
    )
  }

  componentWillUnmount() {
    window.removeEventListener(
      "mousedown",
      this.handleMouseDown,
      passiveCaptureEventObj
    )
    window.removeEventListener(
      "mouseup",
      this.handleMouseUp,
      passiveCaptureEventObj
    )
  }

  mouseIsDown = false
  handleMouseDown = () => {
    this.mouseIsDown = true
  }
  handleMouseUp = () => {
    this.mouseIsDown = false
    if (this.state.hidingActiveDataPoint) {
      this.setState({ hidingActiveDataPoint: false })
    }
  }

  __memoizedCache = {}
  memoizedGetMerged = (prop, obj) => {
    let func = this.__memoizedCache[prop]
    if (!func) {
      func = this.__memoizedCache = memoize(currentVal => ({
        ...defaultsObj[prop],
        ...(currentVal || {})
      }))
    }
    return func(obj)
  }
  memoizedDoubleMerged = (key, obj, fallbacksObj) => {
    const cachedVal = this.__memoizedCache[key]
    if (!cachedVal) {
      const result = { ...fallbacksObj, ...obj }
      this.__memoizedCache[key] = {
        obj,
        fallbacksObj,
        result
      }
      return result
    }

    const {
      obj: prevObj,
      fallbacksObj: prevFallbacksObj,
      result: prevResult
    } = cachedVal

    if (prevObj === obj && prevFallbacksObj === fallbacksObj) {
      return prevResult
    }

    const result = { ...fallbacksObj, ...obj }
    cachedVal.obj = obj
    cachedVal.fallbacksObj = fallbacksObj
    cachedVal.result = result

    return result
  }

  // prevData = this.props.data
  // updateDomain() {
  //   const { xDomain, yDomain, data } = this.props
  //   this.xDomain = xDomain || getMinMaxOfProp("x", data)
  //   this.yDomain = yDomain || getMinMaxOfProp("y", data)
  // }

  // updateIndexCache() {
  //   const indexCache = new Map()
  //   const { data } = this.props
  //   const dataLength = data.length

  //   for (let i = 0; i < dataLength; i++) {
  //     indexCache.set(data[i], i)
  //   }
  //   this.indexCache = indexCache
  // }

  onValueDragStart = () => this.setState({ isDragging: true })

  onValueDragEnd = () =>
    !this.mouseIsInside
      ? this.setState({ isDragging: false, activeIndex: -1 })
      : this.setState({ isDragging: false })

  onValueDrag = series => (oldVal, { chartCoords }) => {
    const { seriesData, onPointDrag } = this.props
    const data = seriesData[series]
    const index = findIndex(propEq("id", oldVal.id))(data)
    if (index > -1) {
      // const newData = update(index, { ...oldVal, ...chartCoords }, data)
      const newData = update(index, { ...oldVal, y: chartCoords.y }, data)

      onPointDrag(newData, series)
    }
  }

  mouseIsInside = false
  setMouseInside = value => () => {
    this.mouseIsInside = value
  }
  // highlightPoint = pt => {
  //   if (!this.state.isDragging) {
  //     if (this.mouseIsDown) {
  //       this.setState({
  //         activeIndex: this.indexCache.get(pt),
  //         hidingActiveDataPoint: true
  //       })
  //     } else {
  //       this.setState({ activeIndex: this.indexCache.get(pt) })
  //     }
  //   }
  // }
  // unhighlightPoints = () => {
  //   this.mouseIsInside = false
  //   if (!this.state.isDragging && this.state.activeIndex !== -1) {
  //     this.setState({ activeIndex: -1 })
  //   }
  // }

  render() {
    const {
      seriesData,
      hoverComponent: HoverComponent,
      noDataComponent: NoDataComponent,
      noDataText,
      formatX,
      formatY,
      lineStyle,
      pointSize,
      pointStyle,
      activePointSize,
      activePointStyle,
      margin,
      horizontalGridLines,
      verticalGridLines,
      xDomain,
      yDomain,
      ...otherProps
    } = this.props

    // if (this.data !== this.prevData) {
    //   this.updateIndexCache()
    //   // this.updateDomain()
    // }

    // const { hidingActiveDataPoint, activeIndex, isDragging } = this.state

    const {
      // xDomain,
      // yDomain,
      onValueDragStart,
      onValueDragEnd,
      onValueDrag,
      setMouseInside
      // highlightPoint,
      // unhighlightPoints
    } = this

    // const [minX, maxX] = xDomain
    // const [minY, maxY] = yDomain

    const mergedLineStyle = this.memoizedGetMerged("lineStyle", lineStyle)
    const mergedPointStyle = this.memoizedDoubleMerged(
      "mergedPointStyle",
      this.memoizedGetMerged("pointStyle", pointStyle),
      mergedLineStyle
    )
    // const mergedActivePointStyle = this.memoizedDoubleMerged(
    //   "mergedActivePointStyle",
    //   this.memoizedGetMerged("activePointStyle", activePointStyle),
    //   mergedPointStyle
    // )

    // const activeDataPoint = data[activeIndex] || null

    // render path booleans
    // const noData = se.length === 0
    // const noActiveDataPoint = activeDataPoint === null

    return (
      <div className="__draggin-chart-container">
        <FlexibleXYPlot
          animation
          dontCheckIfEmpty
          onMouseEnter={setMouseInside(true)}
          onMouseLeave={setMouseInside(false)}
          xDomain={xDomain}
          yDomain={yDomain}
          margin={this.memoizedGetMerged("margin", margin)}
          {...otherProps}
        >
          <XAxis tickFormat={formatX} on0 />
          <YAxis tickFormat={formatY} on0 />
          {Object.entries(seriesData).map(([series, data]) => {
            return (
              <LineMarkSeries
                key={series}
                data={data}
                onValueDragStart={onValueDragStart}
                onValueDragEnd={onValueDragEnd}
                onValueDrag={onValueDrag(series)}
                // onNearestXY={highlightPoint}
                size={pointSize}
                lineStyle={mergedLineStyle}
                markStyle={mergedPointStyle}
                animation={false}
              />
            )
          })}
        </FlexibleXYPlot>
      </div>
    )
  }
}

// export function getMinMaxOfProp(prop, arr) {
//   let min = Infinity
//   let max = -Infinity

//   let currentArrVal
//   let currentArrPropVal
//   const arrLength = arr.length
//   for (let i = 0; i < arrLength; i++) {
//     if (
//       typeof (currentArrVal = arr[i]) === "object" &&
//       currentArrVal !== null &&
//       typeof (currentArrPropVal = currentArrVal[prop]) === "number" &&
//       !Number.isNaN(currentArrPropVal)
//     ) {
//       if (currentArrPropVal < min) min = currentArrPropVal
//       else if (currentArrPropVal > max) max = currentArrPropVal
//     }
//   }

//   return [min, max]
// }
