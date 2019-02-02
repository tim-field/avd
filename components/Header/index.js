import React from "react"
import "./Header.scss"
import classNames from "classnames"

function Header({ user, doLogout, toggleUI }) {
  // console.log('doLogout', doLogout)
  return (
    <div className="Header">
      <div className="appTitle">
        <span>A / V / D</span>
      </div>
      <div className="appUser">
        <div className="uiToggle">
          UI mode
          <div className="uiControls">
            <div className="themePanel">
              <button onClick={() => toggleUI("light")}>light</button>
              <div className={classNames("swatchSet", "light")}>
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
              </div>
            </div>
            <div className="themePanel">
              <button onClick={() => toggleUI("dark")}>dark</button>
              <div className={classNames("swatchSet", "dark")}>
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
              </div>
            </div>
            <div className="themePanel">
              <button onClick={() => toggleUI("generated")}>gerated</button>
              <div className={classNames("swatchSet", "generated")}>
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
              </div>
            </div>
          </div>
        </div>
        <button className="logout" onClick={doLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Header
