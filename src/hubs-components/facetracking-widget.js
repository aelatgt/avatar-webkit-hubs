import "./scene-overlay"
import "./preview-self"
import { render, h } from "preact"
import { FacetrackingWidget } from "../components/FacetrackingWidget"

AFRAME.registerSystem("facetracking-widget", {
  dependencies: ["scene-overlay", "preview-self"],
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
    previewSelf.canvas.style.transform = "scaleX(-1)" // Mirror self preview

    const preactRoot = document.createElement("div")

    function onPreviewVisibilityChange({ open }) {
      previewSelf.enabled = open
      console.log(open ? "enabling preview" : "disabling preview")
    }
    function onAction(action) {
      sceneEl.emit("facetracking_action", action)
    }

    sceneOverlay.shadowRoot.appendChild(preactRoot)
    const props = {
      canvasEl: previewSelf.canvas,
      onPreviewVisibilityChange,
      onAction,
    }
    render(h(FacetrackingWidget, props, null), preactRoot)

    Object.assign(window, { previewSelf, preactRoot })
  },
})
