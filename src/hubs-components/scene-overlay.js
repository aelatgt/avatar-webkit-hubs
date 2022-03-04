const css = String.raw

/**
 * Creates a root element overlaying the A-Frame canvas
 *
 * Usage: append DOM elements to this.shadowRoot
 */
AFRAME.registerSystem("scene-overlay", {
  init: function () {
    const globalStyle = document.createElement("style")
    globalStyle.innerHTML = css`
      #scene-overlay {
        position: fixed;
        pointer-events: none;
        overflow: hidden;
      }
    `
    document.head.appendChild(globalStyle)

    this.root = document.createElement("div")
    this.root.id = "scene-overlay"

    // Create shadow DOM to prevent affecting Hubs client styles
    this.shadowRoot = this.root.attachShadow({ mode: "open" })
    const innerStyle = document.createElement("style")
    innerStyle.innerHTML = css`
      * {
        pointer-events: auto;
      }
    `
    this.shadowRoot.appendChild(innerStyle)

    const link = document.createElement("link")
    link.href = new URL("./room.css", import.meta.url)
    link.rel = "stylesheet"
    this.shadowRoot.appendChild(link)

    document.body.appendChild(this.root)

    this.canvas = this.el.sceneEl.canvas
  },
  tick: function () {
    this.resize()
  },
  resize: function () {
    this.root.style.width = this.canvas.clientWidth + "px"
    this.root.style.height = this.canvas.clientHeight + "px"
  },
})
