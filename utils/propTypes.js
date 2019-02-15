import propTypes from "prop-types"

export const trackType = propTypes.shape({
  name: propTypes.string.isRequired,
  id: propTypes.string.isRequired,
  artist: propTypes.string.isRequired,
  image: propTypes.shape({
    url: propTypes.string.isRequired,
    width: propTypes.number.isRequired,
    height: propTypes.number.isRequired
  }),
  raw: propTypes.object
})

export const playlistType = propTypes.shape({
  id: propTypes.string.isRequired,
  uri: propTypes.string,
  name: propTypes.string.isRequired
})
