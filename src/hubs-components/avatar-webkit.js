import { AUPredictor } from "@quarkworks-inc/avatar-webkit"

AFRAME.registerSystem("avatar-webkit", {
  init: function () {
    this.avatarRig = APP.scene.querySelector("#avatar-rig")
  },
  startPredictor: async function () {
    const rpmController = this.avatarRig.components["rpm-controller"]

    const videoStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 360 },
        facingMode: "user",
      },
    })

    this.predictor = new AUPredictor({
      apiToken: AVATAR_WEBKIT_AUTH_TOKEN,
      srcVideoStream: videoStream,
    })

    this.predictor.onPredict = (results) => {
      const { actionUnits, rotation } = results
      if (rpmController.supported) {
        this.avatarRig.setAttribute("rpm-controller", {
          ...actionUnits,
          rotation: { x: -rotation.pitch, y: rotation.yaw, z: -rotation.roll },
        })
      }
    }

    await this.predictor.start()
    console.log("Predictor started...")

    rpmController.stopDefaultBehaviors()
  },
  stopPredictor: function () {
    this.predictor.stop()

    const rpmController = this.avatarRig.components["rpm-controller"]
    rpmController.restartDefaultBehaviors()
  },
})
