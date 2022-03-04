import { startMediaStream } from "@/utils/media-stream"
import { withFaceButton } from "@/utils/share-button"
import { AUPredictor } from "@quarkworks-inc/avatar-webkit"

const euler = new THREE.Euler()
const quaternion = new THREE.Quaternion()

AFRAME.registerSystem("avatar-webkit", {
  init: function () {
    this.avatarRig = APP.scene.querySelector("#avatar-rig")

    this.headCalibration = new THREE.Quaternion()

    this.rawHeadOrientation = new THREE.Quaternion()

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

    this.el.sceneEl.addEventListener("facetracking_action", (e) => {
      switch (e.detail) {
        case "calibrate_center":
          this.headCalibration.copy(this.rawHeadOrientation).invert()
          break
      }
    })
  },
  startPredictor: async function (stream) {
    const rpmController = this.avatarRig.components["rpm-controller"]

    this.predictor = new AUPredictor({
      apiToken: AVATAR_WEBKIT_AUTH_TOKEN,
      srcVideoStream: stream,
      fps: 30,
    })

    let started = false
    this.el.sceneEl.emit("facetracking_initializing")

    this.predictor.onPredict = (results) => {
      if (!started) {
        started = true
        this.el.sceneEl.emit("facetracking_initialized")
      }
      const { actionUnits, rotation } = results
      if (rpmController.supported) {
        // Convert head rotation from pitch / yaw / roll to quaternion
        euler.set(-rotation.pitch, rotation.yaw, -rotation.roll)
        this.rawHeadOrientation.setFromEuler(euler)
        quaternion.copy(this.rawHeadOrientation)
        quaternion.premultiply(this.headCalibration)

        this.avatarRig.setAttribute("rpm-controller", {
          ...actionUnits,
          headQuaternion: { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
        })
      }
    }

    await this.predictor.start()
    console.log("Predictor started...")

    this.avatarRig.setAttribute("rpm-controller", { trackingIsActive: true })
  },
  stopPredictor: function () {
    this.predictor.stop()
    this.avatarRig.setAttribute("rpm-controller", { trackingIsActive: false })
  },
})
