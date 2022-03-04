/**
 * @typedef {typeof blendShapeNames[number]} BlendShapeName
 * @typedef {Record<BlendShapeName, number>} BlendShapes
 */

export const blendShapeNames = /** @type {const} */ ([
  "browDownLeft",
  "browDownRight",
  "browInnerUp",
  "browOuterUpLeft",
  "browOuterUpRight",
  "cheekPuff",
  "cheekSquintLeft",
  "cheekSquintRight",
  "eyeBlinkLeft",
  "eyeBlinkRight",
  "eyeLookDownLeft",
  "eyeLookDownRight",
  "eyeLookInLeft",
  "eyeLookInRight",
  "eyeLookOutLeft",
  "eyeLookOutRight",
  "eyeLookUpLeft",
  "eyeLookUpRight",
  "eyeSquintLeft",
  "eyeSquintRight",
  "eyeWideLeft",
  "eyeWideRight",
  "jawForward",
  "jawLeft",
  "jawOpen",
  "jawRight",
  "mouthClose",
  "mouthDimpleLeft",
  "mouthDimpleRight",
  "mouthFrownLeft",
  "mouthFrownRight",
  "mouthFunnel",
  "mouthLeft",
  "mouthLowerDownLeft",
  "mouthLowerDownRight",
  "mouthPressLeft",
  "mouthPressRight",
  "mouthPucker",
  "mouthRight",
  "mouthRollLower",
  "mouthRollUpper",
  "mouthShrugLower",
  "mouthShrugUpper",
  "mouthSmileLeft",
  "mouthSmileRight",
  "mouthStretchLeft",
  "mouthStretchRight",
  "mouthUpperUpLeft",
  "mouthUpperUpRight",
  "noseSneerLeft",
  "noseSneerRight",
])

/**
 * Test is the provided object contains the necessary
 * bones and blendShapes from a ReadyPlayerMe avatar
 *
 * @param {HTMLElement} avatarRootEl
 */
export function isValidAvatar(avatarRootEl) {
  try {
    const face = avatarRootEl.querySelector(".Wolf3D_Head").object3DMap.skinnedmesh
    const bones = {}
    avatarRootEl.object3D.traverse((o) => {
      if (o.isBone) {
        bones[o.name] = o
      }
    })

    // RPM face skinnedMesh doesn't include eye blendShapes, don't check for those
    const requiredBlendShapes = blendShapeNames.filter((name) => !name.includes("eyeLook"))
    const hasRequiredBlendShapes = requiredBlendShapes.every((name) => name in face.morphTargetDictionary)

    const requiredBones = ["Head", "RightEye", "LeftEye"]
    const hasRequireBones = requiredBones.every((name) => name in bones)

    return hasRequiredBlendShapes && hasRequireBones
  } catch (e) {
    return false
  }
}

/** @type {BlendShapes} */
export const initialBlendShapes = Object.fromEntries(blendShapeNames.map((name) => [name, 0]))
