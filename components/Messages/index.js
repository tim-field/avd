import React, { useContext } from "react"
import propTypes from "prop-types"
import Store, { connect } from "../../store"
import { messageType } from "../../utils/propTypes"
import { clearMessage } from "../../actions"

const Messages = ({ messages }) => {
  const { dispatch } = useContext(Store)
  return messages.length
    ? messages.map(message => (
        <p key={message.id} className={`message-${message.level}`}>
          {message.message}{" "}
          <button onClick={() => dispatch(clearMessage(message.id))}>x</button>
        </p>
      ))
    : null
}

Messages.propTypes = {
  messages: propTypes.arrayOf(messageType)
}

const mapStateToProps = ({ messages }) => ({
  messages
})

export default connect({ mapStateToProps })(Messages)
