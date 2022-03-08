AFRAME.registerComponent("aura", {
  dependencies: ["billboard"],
  schema: {
    size: { type: "number" },
    color: { type: "color" },
  },
  init: function () {
    const auraPlane = document.createElement("a-entity")
    auraPlane.setAttribute("geometry", { primitive: "plane" })
    auraPlane.setAttribute("material", { shader: "aura", transparent: true })
    auraPlane.setAttribute("position", { z: -0.2 })
    this.el.appendChild(auraPlane)
    this.auraPlane = auraPlane
    window.debug = this
  },
  update: function () {
    this.auraPlane.setAttribute("material", this.data)
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
