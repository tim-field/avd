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
              <div className={classNames("swatchSet", "light")}>
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
              </div>
              <button onClick={() => toggleUI("light")}>light</button>
            </div>
            <div className="themePanel">
              <div className={classNames("swatchSet", "dark")}>
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
              </div>
              <button onClick={() => toggleUI("dark")}>dark</button>
            </div>
            <div className="themePanel">
              <div className={classNames("swatchSet", "generated")}>
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
                <div className="swatch" />
              </div>
              <button onClick={() => toggleUI("generated")}>generated</button>
            </div>
          </div>
        </div>
        <button className="logout" onClick={doLogout}>
          Logout
        </button>
      </div>
      <div className="bubble" />
      <div className="bubble" />
    </div>
  )
}

export default Header
