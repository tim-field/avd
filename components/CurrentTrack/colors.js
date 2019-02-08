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

function hexToHsl(hex, mode = "default") {
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

export function getColors(colors) {
  console.log(colors)
  // gets colours form image, then applies them to document root css variables
  if (colors.length < 1) {
    console.error("no colors")
    return false
  }

  // setColors(colors);
  const rootElement = document.getElementById("html")
  rootElement.setAttribute("data-theme", "generated")

  // These do the actual setting of css variables.
  // needs to be abstracted into another function so it can be called manually.
  document.documentElement.style.setProperty("--backgroundColor", colors[0])
  document.documentElement.style.setProperty("--themeColor", colors[1])
  document.documentElement.style.setProperty("--themeColor-weaker", colors[0])
  document.documentElement.style.setProperty("--themeColor-stronger", colors[5])
  document.documentElement.style.setProperty("--themeColor-weakest", colors[3])
  document.documentElement.style.setProperty(
    "--themeColor-strongest",
    colors[5]
  )
  // this bit determines whether text colour should be dark (on a light background), or vice versa
  if (hexToHsl(colors[0], "l") < 40) {
    // console.log("less than 40: ", hexToHsl(colors[0], "l"))
    document.documentElement.style.setProperty(
      "--textColor",
      "rgba(229,229,229,.9)"
    )
  } else {
    // console.log("more than 40: ", hexToHsl(colors[0], "l"))
    document.documentElement.style.setProperty("--textColor", "rgba(0,0,0,.9)")
  }
}
