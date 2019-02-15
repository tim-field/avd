import React from "react"
// import base64 from "base-64";
// import Favicon from "react-favicon"
import defaultFavicon from "../../assets/defaultFavicon.jpeg"
// import "./Header.scss"

function getTransform(sourceValue) {
  // const tempSource = 11;
  const sourceMax = 12
  const max = 256 //ie, the original svg height
  // const min = 0;
  const percentage = sourceValue / sourceMax
  const availableSpaceRatio = 24.84 / 60
  // console.log('magicValueLarge', availableSpaceRatio);
  // console.log('sourceValue:', sourceValue);
  const convertedAvailableSpace = max * availableSpaceRatio
  // console.log('max', max);
  // console.log('percentage', percentage, "%");
  // console.log(`availableSpaceRatio (${availableSpaceRatio}) of the max (${max}px) is convertedAvailableSpace: (${convertedAvailableSpace})px`);
  // console.log(`normalised percentage (${percentage}) of that is ${convertedAvailableSpace * percentage}px`);
  // console.log(`thus we want  (${convertedAvailableSpace * percentage}px) / of max(${max}): ${convertedAvailableSpace * percentage / max}`);
  // console.log(`move the bar up: ${convertedAvailableSpace * percentage / max}px`);
  if (typeof percentage == "number") {
    return `-${((convertedAvailableSpace * percentage) / max) * 100}%`
  } else {
    // console.log('no percentage found')
    return `0px`
  }
}

function Logo({
  fill,
  arousal,
  valence,
  depth,
  generateImage,
  favIcon,
  svg2Image
}) {
  // TEST THE LOGO GENERATION
  if (generateImage && document.getElementById("logoElement")) {
    document
      .getElementById("generatedLogo")
      .setAttribute(
        "src",
        encodeSvg(document.getElementById("logoElement").outerHTML)
      )
    svg2Image("generatedLogo")
  }
  return (
    <div
      className="Logo"
      onClick={() => generateImage && svg2Image("generatedLogo")}
    >
      <svg width="256px" height="256px" viewBox="0 0 256 256" id="logoElement">
        <g
          id="logo-filled"
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
        >
          <rect
            id="Rectangle"
            fill="#561162"
            x="0"
            y="0"
            width="256"
            height="256"
          />
          <path
            className="letter letterA"
            d="M184,180 C181.238576,180 179,177.761424 179,175 L179,79 C179,76.2385763 181.238576,74 184,74 C217.235878,74 238,93.1719972 238,127 C238,160.828003 217.235878,180 184,180 Z"
            id="Combined-Shape"
            fill="#979797"
            fillRule="nonzero"
          />
          <path
            className="letter letterV"
            d="M93.6159061,73.9999922 L164.767979,73.9986374 C165.264735,74.0323698 165.768545,74.1350032 166.261465,74.3205514 C168.845854,75.2933819 170.152279,78.1770773 169.179449,80.7614655 L133.179449,176.397829 C132.577081,177.998059 131.242092,179.108321 129.699169,179.490912 C129.528889,179.574036 129.352123,179.648363 129.169236,179.713136 C126.566243,180.63503 123.708757,179.272229 122.786864,176.669236 L88.7868639,80.6692357 C87.8649704,78.0662425 89.2277711,75.2087573 91.8307643,74.2868639 C92.2856623,74.1257542 92.7483327,74.0344211 93.2070864,74.0072898 L93.3838268,73.9999966 C93.4613636,73.9981813 93.5387411,73.9981888 93.6159061,73.9999922 Z"
            id="Combined-Shape"
            fill="#979797"
          />
          <path
            className="letter letterD"
            d="M94.3837592,180 L29.6166187,180 C29.5400374,180.001779 29.4632291,180.001788 29.386246,180 L29.0129399,180 L29.0203312,179.977959 C28.6815814,179.944972 28.3411161,179.876701 28.0034615,179.770783 C25.3686307,178.944268 23.9027014,176.138292 24.7292168,173.503462 L54.7292168,77.8670979 C55.2711649,76.1394329 56.6641735,74.914332 58.3019515,74.5085407 C58.4718871,74.4256382 58.648278,74.3514944 58.8307643,74.2868639 C61.4337575,73.3649704 64.2912427,74.7277711 65.2131361,77.3307643 L99.2131361,173.330764 C100.13503,175.933757 98.7722289,178.791243 96.1692357,179.713136 C95.5786511,179.922302 94.9749658,180.013856 94.3837592,180 Z"
            id="Combined-Shape"
            fill="#979797"
          />
          <path
            className="bar barA"
            d="M23.0526316,163 C16.9484317,163 12,158.075132 12,152 C12,145.924868 16.9484317,141 23.0526316,141 L63.9473684,141 C70.0515683,141 75,145.924868 75,152 C75,158.075132 70.0515683,163 63.9473684,163 L23.0526316,163 Z"
            id="Line-3"
            fill="#FFFFFF"
            fillRule="nonzero"
            style={{
              transform: `translateY(7%) translateY(10px) translateY(${getTransform(
                arousal
              )})`
            }}
          />
          <path
            className="bar barV"
            d="M95.0526316,123 C88.9484317,123 84,118.075132 84,112 C84,105.924868 88.9484317,101 95.0526316,101 L135.947368,101 C142.051568,101 147,105.924868 147,112 C147,118.075132 142.051568,123 135.947368,123 L95.0526316,123 Z"
            id="Line-3-Copy"
            fill="#FFFFFF"
            fillRule="nonzero"
            style={{
              transform: `translateY(22%) translateY(10px) translateX(1%) translateY(${getTransform(
                valence
              )})`
            }}
          />
          <path
            className="bar barD"
            d="M169.052632,148 C162.948432,148 158,143.075132 158,137 C158,130.924868 162.948432,126 169.052632,126 L209.947368,126 C216.051568,126 221,130.924868 221,137 C221,143.075132 216.051568,148 209.947368,148 L169.052632,148 Z"
            id="Line-3-Copy-2"
            fill="#FFFFFF"
            fillRule="nonzero"
            style={{
              transform: `translateY(13%) translateY(10px) translateY(${getTransform(
                depth
              )})`
            }}
          />
        </g>
      </svg>
      {generateImage && (
        <div id="test">
          <img src="" id="generatedLogo" />
        </div>
      )}
      {generateImage && (
        <div id="test">
          <img src={favIcon} />
        </div>
      )}
      {generateImage && <Favicon url={favIcon || defaultFavicon} />}
    </div>
  )
}

function encodeSvg(element) {
  const s = new XMLSerializer().serializeToString(
    document.getElementById("logoElement")
  )
  var encodedData = window.btoa(unescape(encodeURIComponent(s)))
  // const theBase64 =  Buffer.from(element).toString('base64');
  // const encoded = base64.encode(element);
  // console.log('encoded: ', encoded);
  return "data:image/svg+xml;base64," + encodedData
}

export default Logo
