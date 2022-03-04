import { blendShapeNames, isValidAvatar } from "@/utils/blendshapes"
import { registerNetworkedAvatarComponent } from "@/utils/hubs-utils"

/**
 * All avatars use this component for ReadyPlayerMe avatar expressions.
 * Unsupported avatars will ignore this data.
 */
AFRAME.registerComponent("rpm-controller", {
  schema: Object.fromEntries(blendShapeNames.map((name) => [name, { default: 0 }])),
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
      head: this.el.object3D.getObjectByName("Head"),
    }

    this.meshes = meshes
    this.bones = bones
    this.loopAnimation = this.avatarRootEl.parentEl.components["loop-animation"]
    this.morphAudioFeedback = this.avatarRootEl.querySelector("[morph-audio-feedback]").components["morph-audio-feedback"]

    window.debug = this
  },
  stopDefaultBehaviors: function () {
    if (this.supported) {
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
  update: function () {
    if (this.supported) {
      for (let i = 0; i < this.meshes.length; ++i) {
        const mesh = this.meshes[i]
        for (let key in this.data) {
          mesh.morphTargetInfluences[mesh.morphTargetDictionary[key]] = this.data[key]
        }
      }
    }
  },
})

registerNetworkedAvatarComponent("rpm-controller")
