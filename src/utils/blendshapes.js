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

export const defaultBaselineNeutral = {
  browDownLeft: 0.14292000404803207,
  cheekSquintLeft: 0.0837113283056486,
  browOuterUpLeft: 0.0005960479803265726,
  browDownRight: 0.15186765250916626,
  browOuterUpRight: 0.002649308265391297,
  cheekSquintRight: 0.07983533252216857,
  browInnerUp: 0.07195527641530391,
  eyeBlinkLeft: 0.008286092891455772,
  eyeBlinkRight: 0.008060047906610742,
  eyeSquintLeft: 0.1775005578601865,
  eyeSquintRight: 0.1758928216591102,
  eyeWideLeft: 0.0384276696458762,
  eyeWideRight: 0.03996200098237262,
  eyeLookDownLeft: 0.004033706223955267,
  eyeLookDownRight: 0.003948707450104452,
  eyeLookInLeft: 0.04418030056143658,
  eyeLookInRight: 0.0820209826341746,
  eyeLookOutLeft: 0.0030659964710422908,
  eyeLookOutRight: 0.003006878913860351,
  eyeLookUpLeft: 0.028767204000691424,
  eyeLookUpRight: 0.029090857808409726,
  jawOpen: 0.08025557589225471,
  jawLeft: 0.013878543688068241,
  jawRight: 0.014181348080548259,
  mouthClose: 0.09547342805544627,
  mouthFunnel: 0.07242722825074889,
  mouthPucker: 0.13948846605237805,
  mouthRollLower: 0.14252952604226954,
  mouthRollUpper: 0.04314594284526849,
  mouthShrugLower: 0.16378268421715397,
  mouthShrugUpper: 0.12618127587666747,
  noseSneerLeft: 0.029718078853023317,
  noseSneerRight: 0.02994943281898618,
  mouthLeft: 0.01104563390993006,
  mouthRight: 0.006609823864141941,
  mouthSmileLeft: 0,
  mouthSmileRight: 0,
  mouthFrownLeft: 0.1089579894213551,
  mouthFrownRight: 0.1089579894213551,
  mouthDimpleLeft: 0.0448081477219363,
  mouthDimpleRight: 0.03845306409022615,
  mouthStretchLeft: 0.1182972417373446,
  mouthStretchRight: 0.11651151087827287,
  mouthPressLeft: 0.08134576392367292,
  mouthPressRight: 0.08500022705777602,
  mouthLowerDownLeft: 0.10099839816662173,
  mouthLowerDownRight: 0.1009940570094999,
  mouthUpperUpLeft: 0.032025989467466216,
  mouthUpperUpRight: 0.028987820494759644,
}
export const defaultBaselinePositive = {
  browDownLeft: 0.31193478302642086,
  cheekSquintLeft: 0.4966666820666009,
  browOuterUpLeft: 0.0014718952547100057,
  browDownRight: 0.3132465963211932,
  browOuterUpRight: 0.001628139684792446,
  cheekSquintRight: 0.4997495173273402,
  browInnerUp: 0.06391730202476087,
  eyeBlinkLeft: 0.041254810113567304,
  eyeBlinkRight: 0.04279744297706484,
  eyeSquintLeft: 0.3118102078435434,
  eyeSquintRight: 0.32421436803236053,
  eyeWideLeft: 0.008044380043260056,
  eyeWideRight: 0.007942548556781014,
  eyeLookDownLeft: 0.08512978974701954,
  eyeLookDownRight: 0.08464192120601105,
  eyeLookInLeft: 0.017978726424517862,
  eyeLookInRight: 0.11517774138923369,
  eyeLookOutLeft: 0.009253886939266922,
  eyeLookOutRight: 0.0032137041453680886,
  eyeLookUpLeft: 0.007242051360121068,
  eyeLookUpRight: 0.007331904871664228,
  jawOpen: 0.11543286710534544,
  jawLeft: 0.017124684270103593,
  jawRight: 0.008602246133473018,
  mouthClose: 0.02589906639806163,
  mouthFunnel: 0.05654594090742553,
  mouthPucker: 0.0179783853019965,
  mouthRollLower: 0.060011151188915854,
  mouthRollUpper: 0.02699725400723775,
  mouthShrugLower: 0.02739969540716398,
  mouthShrugUpper: 0.20718354097814676,
  noseSneerLeft: 0.15364747392460607,
  noseSneerRight: 0.16272873919473266,
  mouthLeft: 0.01516525773905802,
  mouthRight: 0.029074595779598165,
  mouthSmileLeft: 0.574274360879454,
  mouthSmileRight: 0.574274360879454,
  mouthFrownLeft: 0,
  mouthFrownRight: 0,
  mouthDimpleLeft: 0.2425586027797846,
  mouthDimpleRight: 0.24213675984615515,
  mouthStretchLeft: 0.1647236356058485,
  mouthStretchRight: 0.16200694185536765,
  mouthPressLeft: 0.10518212477025311,
  mouthPressRight: 0.10688312777743042,
  mouthLowerDownLeft: 0.5673969602399163,
  mouthLowerDownRight: 0.5752730988419767,
  mouthUpperUpLeft: 0.2072643930658644,
  mouthUpperUpRight: 0.21660619785289678,
}
export const defaultBaselineNegative = {
  browDownLeft: 0.21894755766243107,
  cheekSquintLeft: 0.0720502124938468,
  browOuterUpLeft: 0.001131681028836966,
  browDownRight: 0.2065480429607979,
  browOuterUpRight: 0.0016888267395015664,
  cheekSquintRight: 0.06624369403105379,
  browInnerUp: 0.04989160645875895,
  eyeBlinkLeft: 0.019280808081942064,
  eyeBlinkRight: 0.018514927548377132,
  eyeSquintLeft: 0.20272710728449725,
  eyeSquintRight: 0.20006331235374747,
  eyeWideLeft: 0.022520680990659386,
  eyeWideRight: 0.025571784637023105,
  eyeLookDownLeft: 0.005219463444586615,
  eyeLookDownRight: 0.0052285496397275425,
  eyeLookInLeft: 0.055078669085388145,
  eyeLookInRight: 0.07103339878475431,
  eyeLookOutLeft: 0.0039032066375637967,
  eyeLookOutRight: 0.000868889764285386,
  eyeLookUpLeft: 0.06771758395133971,
  eyeLookUpRight: 0.06749859980501595,
  jawOpen: 0.05135693812513425,
  jawLeft: 0.011016677887952298,
  jawRight: 0.01723693521852213,
  mouthClose: 0.06649715547069114,
  mouthFunnel: 0.09536212090226476,
  mouthPucker: 0.22641890522489633,
  mouthRollLower: 0.1664198520866212,
  mouthRollUpper: 0.0353744479361229,
  mouthShrugLower: 0.46869855290428886,
  mouthShrugUpper: 0.2897678939429373,
  noseSneerLeft: 0.02463435689490283,
  noseSneerRight: 0.026503704323414406,
  mouthLeft: 0.02402928352704954,
  mouthRight: 0.004710406051171298,
  mouthSmileLeft: 0,
  mouthSmileRight: 0,
  mouthFrownLeft: 0.5044462037667596,
  mouthFrownRight: 0.5044462037667596,
  mouthDimpleLeft: 0.04916602395505078,
  mouthDimpleRight: 0.0385806574720608,
  mouthStretchLeft: 0.2014721478745718,
  mouthStretchRight: 0.21024909193626076,
  mouthPressLeft: 0.1444740593184618,
  mouthPressRight: 0.14248490365974414,
  mouthLowerDownLeft: 0.08546819947451495,
  mouthLowerDownRight: 0.07593731665798187,
  mouthUpperUpLeft: 0.033034930992303084,
  mouthUpperUpRight: 0.027125678894874168,
}
