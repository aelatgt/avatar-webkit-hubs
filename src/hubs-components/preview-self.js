const tmpSize = new THREE.Vector2()

const LAYER_PREVIEW = 10
const SIZE = 256

AFRAME.registerSystem("preview-self", {
  init: function () {
    this.enabled = true

    const canvas = document.createElement("canvas")
    canvas.width = SIZE
    canvas.height = SIZE
    const context = canvas.getContext("2d")

    // Create a camera facing the user that only "sees" a specific layer
    const camera = new THREE.PerspectiveCamera(10, 1, 0.1, 1000)
    camera.layers.set(LAYER_PREVIEW)
    camera.position.z = -2
    camera.rotation.y = Math.PI
    camera.updateMatrix()

    const cameraSystem = APP.scene.systems["hubs-systems"].cameraSystem
    const povNode = cameraSystem.avatarPOV // Follows user gaze
    const avatarModelEl = cameraSystem.avatarRig.querySelector(".model") // Avatar glTF

    /**
     * Layers don't cascade -- set the appropriate layer on each object
     * in the avatar glTF and on each light in the scene
     */
    avatarModelEl.addEventListener("model-loaded", () => {
      avatarModelEl.object3D.traverse((o) => o.layers.enable(LAYER_PREVIEW))
      this.el.sceneEl.object3D.traverse((o) => o.isLight && o.layers.enable(LAYER_PREVIEW))
      document.querySelector("[skybox]").object3D.traverse((o) => o.layers.enable(LAYER_PREVIEW))
    })

    /**
     * Create render target where selfie image will be rendered
     * Use RGBA format to enable transparent background
     */
    const renderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
      format: THREE.RGBAFormat,
    })

    const previewEl = document.createElement("a-entity")

    // Keep everything fixed to user gaze
    previewEl.setObject3D("faceCam", camera)
    povNode.appendChild(previewEl)

    const scene = this.el.sceneEl.object3D
    const renderer = this.el.sceneEl.renderer

    Object.assign(this, { previewEl, camera, renderTarget, canvas, context, scene, renderer, cameraSystem })

    this.updateRenderTargetNextTick = false

    const fps = 25
    setInterval(() => {
      this.updateRenderTargetNextTick = true
    }, 1000 / fps)
  },
  tick: function () {
    // BEFORE the scene has rendered normally
    if (this.enabled && this.updateRenderTargetNextTick) {
      this.renderPreview()
      this.updateRenderTargetNextTick = false
    }
  },
  tock: function () {},
  renderPreview: function () {
    // Ensure background is transparent
    // this.el.sceneEl.object3D.background = null

    // MODIFY RENDER SETTINGS
    const tmpOnAfterRender = this.scene.onAfterRender
    delete this.scene.onAfterRender

    this.showPlayerHead()

    this.renderer.getSize(tmpSize)
    this.renderer.setSize(SIZE, SIZE, false)

    this.renderer.render(this.scene, this.camera)
    this.context.drawImage(this.renderer.domElement, 0, 0, SIZE, SIZE)

    // RESTORE RENDER SETTINGS
    this.scene.onAfterRender = tmpOnAfterRender
    this.renderer.setSize(tmpSize.x, tmpSize.y, false)

    this.hidePlayerHead()
  },
  showPlayerHead() {
    const playerHead = APP.scene.systems["camera-tools"].playerHead
    if (playerHead) {
      playerHead.visible = true
      playerHead.scale.setScalar(1)
      playerHead.updateMatrices(true, true)
      playerHead.updateMatrixWorld(true, true)
    }
  },
  hidePlayerHead() {
    const playerHead = APP.scene.systems["camera-tools"].playerHead
    const isInspectingSelf = this.cameraSystem.inspectable?.el === this.cameraSystem.avatarRig
    if (playerHead && !isInspectingSelf) {
      playerHead.visible = false
      playerHead.scale.setScalar(1e-8)
      playerHead.updateMatrices(true, true)
      playerHead.updateMatrixWorld(true, true)
    }
  },
})
