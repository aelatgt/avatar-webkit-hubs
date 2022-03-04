import { AUPredictor } from "@quarkworks-inc/avatar-webkit"

AFRAME.registerSystem("avatar-webkit", {
  startPredictor: async function () {
    const videoStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 360 },
        facingMode: "user",
      },
    })

    const predictor = new AUPredictor({
      apiToken: AVATAR_WEBKIT_AUTH_TOKEN,
      srcVideoStream: videoStream,
    })

    predictor.onPredict = (results) => {
      window.results = results
    }

    await predictor.start()
    console.log("Predictor started...")
  },
})
