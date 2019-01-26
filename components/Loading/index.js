import React from "react"
import {
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Loading.scss"

export default function Loading() {
  return <div className="Loading">
    <span className="iconWrap"><FontAwesomeIcon icon={faSpinner}/></span><p>Loading...</p>
  </div>
}
