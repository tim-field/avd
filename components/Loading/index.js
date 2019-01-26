import React from "react"
import {
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import "./Loading.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Loading() {
  return <div className="Loading">
    <span className="iconWrap"><FontAwesomeIcon icon={faSpinner}/></span><p>Loading...</p>
  </div>
}
