import { useLayoutEffect, useRef, useReducer, useState, useEffect } from "preact/hooks"
import { Button } from "./Button"
import { Collapsible } from "./Collapsible"
import { Initializing } from "./Initializing"
import { SettingsPopup } from "./SettingsPopup"

/** @enum */
const Status = {
  STOPPED: 0,
  INITIALIZING: 1,
  RUNNING: 2,
  PAUSED: 3,
}

export function FacetrackingWidget({ canvasEl, onPreviewVisibilityChange, onAction }) {
  const canvasContainer = useRef()

  const [openSettings, setOpenSettings] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)
  const togglePreview = () => {
    const _openPreview = !openPreview
    onPreviewVisibilityChange({ open: _openPreview })
    setOpenPreview(_openPreview)
  }

  const [status, setStatus] = useState(Status.STOPPED)
  const onClickPause = () => {
    switch (status) {
      case Status.PAUSED:
        APP.scene.emit("facetracking_action", "resume")
        setStatus(Status.RUNNING)
        break
      case Status.RUNNING:
        APP.scene.emit("facetracking_action", "pause")
        setStatus(Status.PAUSED)
        break
    }
  }

  /**
   * Event listeners
   */
  useEffect(() => {
    const onInitializing = () => setStatus(Status.INITIALIZING)
    const onInitialized = () => {
      setStatus(Status.RUNNING)
      setOpenPreview(true)
    }
    const onStop = () => {
      setStatus(Status.STOPPED)
      setOpenPreview(false)
    }
    APP.scene.addEventListener("facetracking_initializing", onInitializing)
    APP.scene.addEventListener("facetracking_initialized", onInitialized)
    APP.scene.addEventListener("facetracking_stopped", onStop)
    return () => {
      APP.scene.removeEventListener("facetracking_initializing", onInitializing)
      APP.scene.removeEventListener("facetracking_initialized", onInitialized)
      APP.scene.removeEventListener("facetracking_stopped", onStop)
    }
  }, [])

  useLayoutEffect(() => {
    canvasContainer.current.appendChild(canvasEl)
  }, [canvasEl])

  const displayWidget = status === Status.RUNNING || status === Status.PAUSED

  return (
    <>
      <div
        style={{ display: displayWidget ? "" : "none" }}
        class="absolute bottom-0 right-0 mx-12 px-4 bg-white rounded-t-xl pointer-events-auto"
      >
        <button class="flex fill-current text-hubs-gray justify-center w-full focus:outline-none" onClick={togglePreview}>
          <box-icon name={openPreview ? "chevron-down" : "chevron-up"}></box-icon>
        </button>
        <Collapsible open={openPreview}>
          <div ref={canvasContainer} class="mb-4" />
          <div class="flex justify-center gap-2 mb-4">
            <Button onClick={onClickPause}>
              <box-icon name={status === Status.PAUSED ? "play" : "pause"}></box-icon>
              {status === Status.PAUSED ? "Resume" : "Pause"}
            </Button>
            <Button onClick={() => setOpenSettings(!openSettings)}>
              <box-icon name="slider-alt"></box-icon>
            </Button>
          </div>
        </Collapsible>
      </div>
      {openSettings && <SettingsPopup onClose={() => setOpenSettings(false)} onAction={onAction} />}
      {status === Status.INITIALIZING && <Initializing />}
    </>
  )
}
