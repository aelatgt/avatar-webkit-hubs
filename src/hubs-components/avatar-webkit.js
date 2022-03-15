import { applyIntensities, computeSimilarityVector, initialBlendShapes, geometryBlendShapesDesymmetrized } from "@/utils/blendshapes"
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
    this.baselineNeutral = { ...initialBlendShapes }
    this.baselineNegative = { ...initialBlendShapes, mouthFrownLeft: 1, mouthFrownRight: 1 }
    this.baselinePositive = { ...initialBlendShapes, mouthSmileLeft: 1, mouthSmileRight: 1 }
    this.intensities = Object.fromEntries(geometryBlendShapesDesymmetrized.map((name) => [name, 1]))
    this.intensities["mouthSmile"] = 0.6

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
          "action_end_video_sharing",
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
        case "set_intensities":
          const intensities = e.detail.payload
          Object.assign(this.intensities, intensities)
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
        this.rawActionUnits = actionUnits
        const [similarityNeutral, similarityNegative, similarityPositive] = computeSimilarityVector(actionUnits, [
          this.baselineNeutral,
          this.baselineNegative,
          this.baselinePositive,
        ])
        applyIntensities(actionUnits, this.intensities)

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

    await this.predictor.start()
    console.log("Predictor started...")

    this.avatarRig.setAttribute("rpm-controller", { trackingIsActive: true })
  },
  stopPredictor: function () {
    this.predictor.stop()
    this.avatarRig.setAttribute("rpm-controller", { trackingIsActive: false })
    this.el.sceneEl.emit("facetracking_stopped")
  },
})
