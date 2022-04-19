import {
  computeSimilarityVector,
  initialBlendShapes,
  geometryBlendShapesDesymmetrized,
  applyRange,
  defaultBaselineNeutral,
  defaultBaselinePositive,
  defaultBaselineNegative,
} from "@/utils/blendshapes"
import { startMediaStream } from "@/utils/media-stream"
import { withFaceButton } from "@/utils/share-button"
import { AUPredictor } from "@quarkworks-inc/avatar-webkit"

const euler = new THREE.Euler()
const quaternion = new THREE.Quaternion()

AFRAME.registerSystem("avatar-webkit", {
  init: function () {
    window.avatarWebkit = this

    this.avatarRig = APP.scene.querySelector("#avatar-rig")

    this.headCalibration = new THREE.Quaternion()
    this.baselineNeutral = { ...defaultBaselineNeutral }
    this.baselineNegative = { ...defaultBaselineNegative }
    this.baselinePositive = { ...defaultBaselinePositive }
    this.range = [-1, 0, 0.6] // lo, mid, hi
    this.enhancements = false

    this.rawHeadOrientation = new THREE.Quaternion()
    this.rawActionUnits = { ...initialBlendShapes }

    this.el.addEventListener("share_video_failed", () => {
      alert("Failed to start webcam, have you granted camera permissions?")
    })

    withFaceButton((button) => {
      button.onclick = () => {
        const onStreamSuccess = (stream) => {
          this.startPredictor(stream)
        }
        const onStreamError = (error) => {
          // This doesn't seem to ever run, hence the "share_video_failed" listener
          console.error(error)
        }
        startMediaStream(onStreamSuccess, onStreamError)
        this.el.sceneEl.addEventListener(
          "share_video_disabled",
          () => {
            this.stopPredictor()
          },
          { once: true }
        )
      }
    })

    this.el.sceneEl.addEventListener("facetracking_action", (e) => {
      switch (e.detail.type) {
        case "calibrate_center":
          this.headCalibration.copy(this.rawHeadOrientation).invert()
          break
        case "calibrate_neutral":
          Object.assign(this.baselineNeutral, this.rawActionUnits)
          break
        case "calibrate_negative":
          Object.assign(this.baselineNegative, this.rawActionUnits)
          break
        case "calibrate_positive":
          Object.assign(this.baselinePositive, this.rawActionUnits)
          break
        case "pause":
          this.avatarRig.setAttribute("rpm-controller", { trackingIsActive: false })
          break
        case "resume":
          this.avatarRig.setAttribute("rpm-controller", { trackingIsActive: true })
          break
        case "set_range":
          for (let i = 0; i < this.range.length; ++i) {
            this.range[i] = e.detail.payload[i]
          }
          break
        case "set_enhancements":
          this.enhancements = e.detail.payload
          this.el.sceneEl.emit("extensions_setvisible", { aura: this.enhancements, particles: this.enhancements })
          break
        case "stop":
          this.stopAll()
          break
      }
    })
  },
  startPredictor: async function (stream) {
    const rpmController = this.avatarRig.components["rpm-controller"]

    this.el.sceneEl.emit("facetracking_initializing", "Loading face tracker model...")

    this.predictor = new AUPredictor({
      apiToken: AVATAR_WEBKIT_AUTH_TOKEN,
      fps: 30,
    })

    let started = false

    this.predictor.onPredict = (results) => {
      if (!started) {
        started = true
        this.el.sceneEl.emit("facetracking_initialized")
      }
      const { actionUnits, rotation } = results
      if (rpmController.supported) {
        this.rawActionUnits = actionUnits
        const [similarityNeutral, similarityNegative, similarityPositive] = computeSimilarityVector(actionUnits, [
          this.baselineNeutral,
          this.baselineNegative,
          this.baselinePositive,
        ])
        applyRange(actionUnits, this.range)

        // Convert head rotation from pitch / yaw / roll to quaternion
        euler.set(-rotation.pitch, rotation.yaw, -rotation.roll)
        this.rawHeadOrientation.setFromEuler(euler)
        quaternion.copy(this.rawHeadOrientation)
        quaternion.premultiply(this.headCalibration)

        this.avatarRig.setAttribute("rpm-controller", {
          ...actionUnits,
          headQuaternion: { x: quaternion.x, y: quaternion.y, z: quaternion.z, w: quaternion.w },
          similarityNeutral,
          similarityNegative,
          similarityPositive,
        })
      }
    }

    try {
      await this.predictor.start({ stream })
      this.el.sceneEl.emit("facetracking_initializing", "Looking for a face...")
      this.avatarRig.setAttribute("rpm-controller", { trackingIsActive: true })
    } catch (e) {
      this.stopAll()
      console.error(e)
      alert("There was a problem while initializing the face tracker. Try again in a bit?")
    }
  },
  stopPredictor: function () {
    this.predictor.stop()
    this.avatarRig.setAttribute("rpm-controller", { trackingIsActive: false })
    this.el.sceneEl.emit("facetracking_stopped")
  },
  stopAll: function () {
    this.stopPredictor()
    this.el.sceneEl.emit("action_end_video_sharing")
  },
})
