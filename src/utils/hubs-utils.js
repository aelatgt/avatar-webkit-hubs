import { blendShapeNames } from "./blendshapes"

window.blendShapeNames = blendShapeNames

/**
 * Modifies an existing component's dependencies array.
 * This allows a new component to appear alongside a built-in Hubs component
 *
 * @param {string} baseComponent Name of the component whose dependencies should be modified
 * @param {string} dependentComponent Name of the component to inject in baseComponent's dependencies
 */
export function registerDependency(baseComponent, dependentComponent) {
  AFRAME.components[baseComponent].dependencies ??= []
  AFRAME.components[baseComponent].dependencies.push(dependentComponent)
}

/**
 * Add a component to be networked for each avatar
 *
 * @param {string} name Name of the component to add to the "remote-avatar" NAF template
 * @param {any} value Initial value for the component
 */
export function registerNetworkedAvatarComponent(name, value) {
  const stringValue = AFRAME.utils.styleParser.stringify(value)

  // Attach component locally so we can control it (since attachTemplateToLocal=false on #remote-avatar)
  document.querySelector("#avatar-rig").setAttribute(name, stringValue)

  // Inject component into #remote-avatar template for remote users
  NAF.schemas.templateCache["#remote-avatar"].firstElementChild.setAttribute(name, stringValue)

  // Set component to be synced in schema
  NAF.schemas.schemaDict["#remote-avatar"].components.push(name)
}

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
