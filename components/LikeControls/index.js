import React, { useContext } from "react"
import classNames from "classnames"
import propTypes from "prop-types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Store, { connect } from "../../store"
import { saveTrackLike } from "../../actions"
import "./LikeControls.scss"

const LikeControls = ({ liked, userId, trackId }) => {
  const { dispatch } = useContext(Store)
  return (
    <div className="likeControls">
      <button
        className={classNames({ active: liked === false })}
        onClick={() =>
          dispatch(
            saveTrackLike(userId, trackId, liked === false ? undefined : false)
          )
        }
      >
        <FontAwesomeIcon icon="thumbs-down" />
      </button>
      <button
        className={classNames({ active: liked })}
        onClick={() =>
          dispatch(saveTrackLike(userId, trackId, liked ? undefined : true))
        }
      >
        <FontAwesomeIcon icon="thumbs-up" />
      </button>
    </div>
  )
}

LikeControls.propTypes = {
  liked: propTypes.bool,
  userId: propTypes.string.isRequired,
  trackId: propTypes.string.isRequired
}

const mapStateToProps = ({ trackLiked: liked, userId, trackId }) => ({
  liked,
  userId,
  trackId
})

export default connect({ mapStateToProps })(LikeControls)
