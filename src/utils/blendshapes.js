/**
 * @typedef {typeof blendShapeNames[number]} BlendShapeName
 * @typedef {Record<BlendShapeName, number>} BlendShapes
 */

export const blendShapeNames = /** @type {const} */ ([
  "browDownLeft",
  "cheekSquintLeft",
  "browOuterUpLeft",
  "browDownRight",
  "browOuterUpRight",
  "cheekSquintRight",
  "browInnerUp",
  "eyeBlinkLeft",
  "eyeBlinkRight",
  "eyeSquintLeft",
  "eyeSquintRight",
  "eyeWideLeft",
  "eyeWideRight",
  "eyeLookDownLeft",
  "eyeLookDownRight",
  "eyeLookInLeft",
  "eyeLookInRight",
  "eyeLookOutLeft",
  "eyeLookOutRight",
  "eyeLookUpLeft",
  "eyeLookUpRight",
  "jawOpen",
  "jawLeft",
  "jawRight",
  "mouthClose",
  "mouthFunnel",
  "mouthPucker",
  "mouthRollLower",
  "mouthRollUpper",
  "mouthShrugLower",
  "mouthShrugUpper",
  "noseSneerLeft",
  "noseSneerRight",
  "mouthLeft",
  "mouthRight",
  "mouthSmileLeft",
  "mouthSmileRight",
  "mouthFrownLeft",
  "mouthFrownRight",
  "mouthDimpleLeft",
  "mouthDimpleRight",
  "mouthStretchLeft",
  "mouthStretchRight",
  "mouthPressLeft",
  "mouthPressRight",
  "mouthLowerDownLeft",
  "mouthLowerDownRight",
  "mouthUpperUpLeft",
  "mouthUpperUpRight",
])

// Subset of blendShapes that impacts face geometry
export const geometryBlendShapes = blendShapeNames.filter((name) => !name.includes("eyeLook"))

// Maps e.g. "mouthSmileLeft" to just "mouthSmile"
export const desymmetrizeMap = Object.fromEntries(blendShapeNames.map((name) => [name, name.replace(/Left|Right/, "")]))

// Mutation of geometryBlendShapes to remove symmetry info,
export const geometryBlendShapesDesymmetrized = Array.from(new Set(geometryBlendShapes.map((name) => desymmetrizeMap[name])))

Object.assign(window, { blendShapeNames, geometryBlendShapes, geometryBlendShapesDesymmetrized, desymmetrizeMap })

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

/**
 * @param {BlendShapes} blendShapesA
 * @param {BlendShapes} blendShapesB
 */
export function computeSimilarity(blendShapesA, blendShapesB) {
  let diff = 0
  for (let i = 0; i < geometryBlendShapes.length; ++i) {
    const name = geometryBlendShapes[i]
    diff -= Math.abs((blendShapesA[name] ?? 0) - (blendShapesB[name] ?? 0))
  }
  return diff
}

// https://gist.github.com/cyphunk/6c255fa05dd30e69f438a930faeb53fe?permalink_comment_id=3649882#gistcomment-3649882
function softmax(logits) {
  const maxLogit = Math.max(...logits)
  const scores = logits.map((l) => Math.exp(l - maxLogit))
  const denom = scores.reduce((a, b) => a + b)
  return scores.map((s) => s / denom)
}

/**
 * @param {BlendShapes} blendShapes
 * @param {BlendShapes[]} baselines
 */
export function computeSimilarityVector(blendShapes, baselines) {
  const distances = []
  for (let i = 0; i < baselines.length; ++i) {
    distances[i] = computeSimilarity(blendShapes, baselines[i])
  }
  return softmax(distances)
}

/**
 *
 * @param {BlendShapes} blendShapes
 * @param {{[name: string]: number}} intensities - E.g. { "mouthSmile": 1 }
 */
export function applyIntensities(blendShapes, intensities) {
  for (let name in blendShapes) {
    blendShapes[name] *= intensities[desymmetrizeMap[name]] ?? 1
  }
}

/**
 *
 * @param {BlendShapes} blendShapes
 * @param {number[]} range
 */
export function applyRange(blendShapes, range) {
  const [lo, mid, hi] = range
  let smileAmount = (blendShapes.mouthSmileLeft + blendShapes.mouthSmileRight) / 2
  let frownAmount = (blendShapes.mouthFrownLeft + blendShapes.mouthFrownRight) / 2
  let mouthValue = smileAmount - frownAmount

  // LERP in either low or high range
  if (mouthValue > mid) {
    mouthValue = mid + mouthValue * (hi - mid)
  } else {
    mouthValue = mid + mouthValue * (mid - lo)
  }

  if (mouthValue > 0) {
    smileAmount = mouthValue
    frownAmount = 0
  } else {
    frownAmount = -mouthValue
    smileAmount = 0
  }

  blendShapes["mouthSmileLeft"] = blendShapes["mouthSmileRight"] = smileAmount
  blendShapes["mouthFrownLeft"] = blendShapes["mouthFrownRight"] = frownAmount
}
