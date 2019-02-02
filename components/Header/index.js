import React from "react"
import "./Header.scss"

function Header({ user, doLogout, toggleUI }) {
  // console.log('doLogout', doLogout)
  return (
    <div className="Header">
      <div className="appTitle">
        <span>A / V / D</span>
      </div>
      <div className="appUser">
        <button className="uiToggle">
          UI mode
          <div className="uiControls">
            <button onClick={() => toggleUI("light")}>light</button>
            <button onClick={() => toggleUI("dark")}>dark</button>
            <button onClick={() => toggleUI("generated")}>gerated</button>
          </div>
        </button>
        <button className="logout" onClick={doLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Header
