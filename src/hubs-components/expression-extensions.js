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

const SIMILARITY_THRESHOLD = 0.5
const LAMBDA = 0.4

AFRAME.registerComponent("expression-extensions", {
  dependencies: ["billboard"],
  schema: {
    positiveInfluence: { default: 0 },
    negativeInfluence: { default: 0 },
  },
  init: function () {
    const auraEl = document.createElement("a-entity")
    auraEl.setAttribute("geometry", { primitive: "plane" })
    auraEl.setAttribute("material", { shader: "aura", transparent: true })
    auraEl.setAttribute("position", { z: -0.2 })
    auraEl.setAttribute("visible", false)

    const particlesEl = document.createElement("a-entity")
    particlesEl.setAttribute("visible", false)
    const particlesPositiveEl = document.createElement("a-entity")
    const particlesNegativeEl = document.createElement("a-entity")

    particlesPositiveEl.setAttribute("particle-emitter", { ...particleSettings, src: twemojiSmile })
    particlesNegativeEl.setAttribute("particle-emitter", { ...particleSettings, src: twemojiFrown })
    particlesEl.appendChild(particlesPositiveEl)
    particlesEl.appendChild(particlesNegativeEl)

    this.el.appendChild(auraEl)
    this.el.appendChild(particlesEl)

    this.el.sceneEl.addEventListener("extensions_setvisible", (e) => {
      auraEl.setAttribute("visible", e.detail.aura)
      particlesEl.setAttribute("visible", e.detail.particles)
    })

    this.responsePositive = 0
    this.responseNegative = 0

    Object.assign(this, { auraEl, particlesPositiveEl, particlesNegativeEl })
  },
  update: function () {
    let responsePositive = remapSimilarity(this.data.positiveInfluence)
    let responseNegative = remapSimilarity(this.data.negativeInfluence)

    this.responsePositive = THREE.MathUtils.lerp(this.responsePositive, responsePositive, LAMBDA)
    this.responseNegative = THREE.MathUtils.lerp(this.responseNegative, responseNegative, LAMBDA)

    let size = Math.max(this.responseNegative, this.responsePositive)
    const color = this.responsePositive > this.responseNegative ? "#f5f242" : "#c8dff7"
    this.auraEl.setAttribute("material", { color, size })

    this.particlesPositiveEl.setAttribute("particle-emitter", {
      startOpacity: this.responsePositive,
      middleOpacity: this.responsePositive,
      endOpacity: 0,
    })
    this.particlesNegativeEl.setAttribute("particle-emitter", {
      startOpacity: this.responseNegative,
      middleOpacity: this.responseNegative,
      endOpacity: 0,
    })
  },
})

function remapSimilarity(value) {
  return Math.max(0, (value - SIMILARITY_THRESHOLD) / (1 - SIMILARITY_THRESHOLD))
}

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
