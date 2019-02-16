import React, { useEffect, useContext } from "react"
import propTypes from "prop-types"
import api from "../../utils/api"
import { userType } from "../../utils/propTypes"
import Store, { connect } from "../../store"
import UserImage from "../UserImage"
import "./Listeners.scss"
import { loadListeners } from "../../actions"

function Listeners({ trackId, userId, listeners }) {
  const { dispatch } = useContext(Store)
  useEffect(() => {
    if (trackId) {
      dispatch(loadListeners(trackId))
    }
  }, [trackId])

  function followUser(followId) {
    if (userId !== followId) {
      api({ action: "/user/follow", data: { userId, followId } }).then(
        following => dispatch({ type: "set-following", following })
      )
    }
  }

  return listeners.length ? (
    <div className="Listeners">
      <h4>Listeners</h4>
      <ul className="ListenersList">
        {listeners.map(user => (
          <li key={user.id} className="avatar">
            <button onClick={() => followUser(user.id)}>
              <UserImage user={user} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div className="Listeners">
      <p className="noData">Be the first to rate this track.</p>
    </div>
  )
}

Listeners.propTypes = {
  trackId: propTypes.string.isRequired,
  userId: propTypes.string.isRequired,
  listeners: propTypes.arrayOf(userType)
}

const mapStateToProps = ({ listeners }) => ({
  listeners
})

export default connect({ mapStateToProps })(Listeners)
