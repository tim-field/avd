const HEX_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

// function hexToRgb(hex) {
//   // converts hex color into rgb color
//   var result = HEX_REGEX.exec(hex)
//   return result
//     ? {
//         r: parseInt(result[1], 16),
//         g: parseInt(result[2], 16),
//         b: parseInt(result[3], 16)
//       }
//     : null
// }

export function hexToHsl(hex, mode = "default") {
  // converts hex color into hsl colour.
  // 'mode' sets whether to return the whole string 'hsl(12, 34%, 12%)', or a single value h = 23
  var result = HEX_REGEX.exec(hex)

  var r = parseInt(result[1], 16)
  var g = parseInt(result[2], 16)
  var b = parseInt(result[3], 16)

  ;(r /= 255), (g /= 255), (b /= 255)
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  var h,
    s,
    l = (max + min) / 2

  if (max == min) {
    h = s = 0 // achromatic
  } else {
    var d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  s = s * 100
  s = Math.round(s)
  l = l * 100
  l = Math.round(l)
  h = Math.round(360 * h)

  var colorInHSL = "hsl(" + h + ", " + s + "%, " + l + "%)"
  let returnValue = colorInHSL
  switch (mode) {
    case "h":
      returnValue = h
      break
    case "s":
      returnValue = s
      break
    case "l":
      returnValue = l
      break
    default:
      returnValue = colorInHSL
  }
  return returnValue
}
