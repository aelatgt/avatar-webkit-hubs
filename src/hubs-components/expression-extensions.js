import twemojiSmile from "@/assets/1f604.png"
import twemojiFrown from "@/assets/1f627.png"

const particleSettings = {
  resolve: false,
  particleCount: 20,
  startSize: 0.01,
  endSize: 0.2,
  sizeRandomness: 0.05,
  lifetime: 1,
  lifetimeRandomness: 0.2,
  ageRandomness: 1,
  startVelocity: { x: 0, y: 1, z: 0 },
  endVelocity: { x: 0, y: 0.25, z: 0 },
  startOpacity: 1,
  middleOpacity: 1,
  endOpacity: 0,
}

AFRAME.registerComponent("expression-extensions", {
  dependencies: ["billboard"],
  schema: {
    positiveInfluence: { default: 0 },
    negativeInfluence: { default: 0 },
  },
  init: function () {
    const plane = document.createElement("a-entity")
    plane.setAttribute("geometry", { primitive: "plane" })
    plane.setAttribute("material", { shader: "aura", transparent: true })
    plane.setAttribute("position", { z: -0.2 })
    this.el.appendChild(plane)

    this.el.setAttribute("particle-emitter", particleSettings)

    this.plane = plane
    window.debug = this
  },
  update: function () {
    const size = Math.max(this.data.negativeInfluence, this.data.positiveInfluence)
    const color = this.data.positiveInfluence > this.data.negativeInfluence ? "#f5f242" : "#c8dff7"
    this.plane.setAttribute("material", { color, size })

    const src = this.data.positiveInfluence > this.data.negativeInfluence ? twemojiSmile : twemojiFrown
    this.el.setAttribute("particle-emitter", { src, startOpacity: size, middleOpacity: size, endOpacity: 0 })
  },
})

AFRAME.registerShader("aura", {
  schema: {
    color: { type: "color", is: "uniform" },
    size: { type: "number", is: "uniform", default: 1 },
  },
  vertexShader: /* glsl */ `
    uniform float size;
    varying vec3 v_pos;
    void main() {
      v_pos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position * size, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    #define PI 3.14159
    #define RINGS 4.0
    #define OPACITY 0.5
    
    uniform vec3 color;
    varying vec3 v_pos;
    void main() {
      float t = length(v_pos) * 2.0;
      float maskCircle = step(t, 1.0);
      float maskRings = cos(t * 2.0 * PI * RINGS + PI) * 0.5 + 0.5;
      gl_FragColor = vec4(color, maskCircle * maskRings * OPACITY);
    }
  `,
})
