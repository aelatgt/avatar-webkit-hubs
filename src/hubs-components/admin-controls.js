import GUI from "lil-gui"

AFRAME.registerSystem("admin-controls", {
  init: function () {
    const emitForEveryone = (name, detail) => {
      NAF.connection.broadcastDataGuaranteed("admin_emit", { name, detail })
      this.el.sceneEl.emit(name, detail)
    }

    const isRoomCreator = APP.scene.systems.permissions.canOrWillIfCreator("update_hub")

    if (isRoomCreator) {
      const container = document.createElement("div")
      container.style.position = "fixed"
      document.body.appendChild(container)

      const gui = new GUI({ container })

      const params = {
        aura: false,
        particles: false,
      }

      gui.add(params, "aura")
      gui.add(params, "particles")

      const sync = () => {
        const { aura, particles } = params
        emitForEveryone("extensions_setvisible", { aura, particles })
      }
      params["sync"] = sync
      gui.add(params, "sync")
      gui.onChange(sync)
    }
    NAF.connection.onConnect(() => {
      NAF.connection.subscribeToDataChannel("admin_emit", (fromClientId, dataType, data, source) => {
        const { name, detail } = data
        this.el.sceneEl.emit(name, detail)
      })
    })
    const logEvent = (e) => console.log(e.type, e)
    this.el.sceneEl.addEventListener("aura_setvisible", logEvent)
    this.el.sceneEl.addEventListener("particles_setvisible", logEvent)
  },
})
