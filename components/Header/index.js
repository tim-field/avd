import React from "react"
import "./Header.scss"

function Header({
  user,
  doLogout,
  toggleUI
}) {
  // console.log('doLogout', doLogout)
  return (
    <div className="Header">
      <div className="appTitle"><span>A / V / L</span></div>
      <div className="appUser">
        <button className="uiToggle" onClick={toggleUI}>
            UI mode
        </button>
        <button className="logout" onClick={doLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Header