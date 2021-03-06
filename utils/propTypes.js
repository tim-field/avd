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

export const userType = propTypes.shape({
  id: propTypes.string.isRequired,
  display_name: propTypes.string.isRequired,
  images: propTypes.arrayOf(
    propTypes.shape({
      url: propTypes.string
    })
  )
})

export const messageType = propTypes.shape({
  id: propTypes.string.isRequired,
  level: propTypes.string.isRequired,
  message: propTypes.string.isRequired
})

export const presetType = propTypes.shape({
  id: propTypes.string.isRequired,
  name: propTypes.string.isRequired,
  values: propTypes.arrayOf(propTypes.number).isRequired
})
