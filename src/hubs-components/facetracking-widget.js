import "./scene-overlay"
import "./preview-self"
import "./avatar-webkit"
import { render, h } from "preact"
import { FacetrackingWidget } from "../components/FacetrackingWidget"

AFRAME.registerSystem("facetracking-widget", {
  dependencies: ["scene-overlay", "preview-self", "avatar-webkit"],
  schema: {
    paused: { default: false },
  },
  init: function () {
    const sceneEl = this.el.sceneEl
    this.el.sceneEl.addEventListener("facetracking_getstate", (e) => {
      this.el.setAttribute("facetracking-widget", e.detail)
    })

    const sceneOverlay = this.el.sceneEl.systems["scene-overlay"]
    const previewSelf = this.el.sceneEl.systems["preview-self"]
    const avatarWebkit = this.el.sceneEl.systems["avatar-webkit"]

    previewSelf.canvas.style.transform = "scaleX(-1)" // Mirror self preview

    const preactRoot = document.createElement("div")

    function onPreviewVisibilityChange({ open }) {
      previewSelf.enabled = open
    }
    function onAction(action) {
      sceneEl.emit("facetracking_action", action)
    }

    this.el.sceneEl.addEventListener("facetracking_stopped", () => (previewSelf.enabled = false))

    sceneOverlay.shadowRoot.appendChild(preactRoot)
    const props = {
      canvasEl: previewSelf.canvas,
      onPreviewVisibilityChange,
      onAction,
      initialRange: avatarWebkit.range,
    }
    render(h(FacetrackingWidget, props, null), preactRoot)

    Object.assign(window, { previewSelf, preactRoot })
  },
})
