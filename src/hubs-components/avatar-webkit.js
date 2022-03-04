import { startMediaStream } from "@/utils/media-stream"
import { withFaceButton } from "@/utils/share-button"
import { AUPredictor } from "@quarkworks-inc/avatar-webkit"

AFRAME.registerSystem("avatar-webkit", {
  init: function () {
    this.avatarRig = APP.scene.querySelector("#avatar-rig")

    withFaceButton((button) => {
      button.onclick = () => {
        this.startPredictor()
        startMediaStream((stream) => {
          this.startPredictor(stream)
        })
      }
    })

    this.el.sceneEl.addEventListener("action_end_video_sharing", () => {
      this.stopPredictor()
    })
  },
  startPredictor: async function (stream) {
    const rpmController = this.avatarRig.components["rpm-controller"]

    this.predictor = new AUPredictor({
      apiToken: AVATAR_WEBKIT_AUTH_TOKEN,
      srcVideoStream: stream,
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
