import { blendShapeNames, isValidAvatar } from "@/utils/blendshapes"
import { registerNetworkedAvatarComponent } from "@/utils/hubs-utils"

const blendShapeSchema = Object.fromEntries(blendShapeNames.map((name) => [name, { default: 0 }]))

/**
 * All avatars use this component for networked ReadyPlayerMe avatar expressions.
 * Unsupported avatars will ignore this data.
 */
AFRAME.registerComponent("rpm-controller", {
  schema: {
    ...blendShapeSchema,
    trackingIsActive: { default: false },
    headQuaternion: { type: "vec4" },
  },
  init: function () {
    this.el.addEventListener("model-loaded", () => {
      this.avatarRootEl = this.el.querySelector(".AvatarRoot")
      this.supported = isValidAvatar(this.avatarRootEl)
      if (!this.supported) {
        console.log("Unsupported avatar:", this.el)
      } else {
        console.log("Detected RPM avatar:", this.el)
        this.initRPMAvatar()
        this.update()
      }
    })
  },
  initRPMAvatar: function () {
    const meshes = []
    this.el.object3D.traverse((o) => {
      if (o.isMesh && o.morphTargetDictionary) {
        meshes.push(o)
      }
    })

    const bones = {
      leftEye: this.el.object3D.getObjectByName("LeftEye"),
      rightEye: this.el.object3D.getObjectByName("RightEye"),
    }

    this.headQuaternionTarget = this.avatarRootEl.components["ik-controller"].headQuaternion

    this.meshes = meshes
    this.bones = bones
    this.loopAnimation = this.avatarRootEl.parentEl.components["loop-animation"]
    this.morphAudioFeedback = this.avatarRootEl.querySelector("[morph-audio-feedback]").components["morph-audio-feedback"]

    window.debug = this
  },
  stopDefaultBehaviors: function () {
    if (this.supported) {
      this.headQuaternionTarget.identity()

      // Pause eye animation
      this.loopAnimation.currentActions.forEach((action) => action.stop())

      // Pause mouth feedback
      this.morphAudioFeedback.pause()
      const { morphs } = this.morphAudioFeedback
      morphs.forEach(({ mesh, morphNumber }) => (mesh.morphTargetInfluences[morphNumber] = 0))
    }
  },
  restartDefaultBehaviors: function () {
    if (this.supported) {
      this.loopAnimation.currentActions.forEach((action) => action.play())
      this.morphAudioFeedback.play()
    }
  },
  update: function (oldData = {}) {
    if (oldData.trackingIsActive !== this.data.trackingIsActive) {
      if (this.data.trackingIsActive) {
        this.stopDefaultBehaviors()
      } else {
        this.restartDefaultBehaviors()
      }
    }

    if (this.supported) {
      // Facial morphs
      for (let i = 0; i < this.meshes.length; ++i) {
        const mesh = this.meshes[i]
        for (let key in this.data) {
          mesh.morphTargetInfluences[mesh.morphTargetDictionary[key]] = this.data[key]
        }
      }

      // Head rotation
      this.headQuaternionTarget.set(
        this.data.headQuaternion.x,
        this.data.headQuaternion.y,
        this.data.headQuaternion.z,
        this.data.headQuaternion.w
      )

      // Eye rotation
      this.bones.rightEye.rotation.set(
        -Math.PI / 2 + this.data["eyeLookDownRight"] * 0.5 - this.data["eyeLookUpRight"] * 0.5,
        0,
        Math.PI - this.data["eyeLookOutRight"] + this.data["eyeLookOutLeft"]
      )
      this.bones.leftEye.rotation.copy(this.bones.rightEye.rotation)
      this.bones.leftEye.updateMatrix()
      this.bones.rightEye.updateMatrix()
    }
  },
})

registerNetworkedAvatarComponent("rpm-controller")
