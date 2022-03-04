import { useLayoutEffect, useRef, useReducer, useState, useEffect } from "preact/hooks"
import { Button } from "./Button"
import { Collapsible } from "./Collapsible"
import { Initializing } from "./Initializing"
import { SettingsPopup } from "./SettingsPopup"

export function FacetrackingWidget({ canvasEl, onPreviewVisibilityChange, onAction }) {
  const canvasContainer = useRef()

  const previewReducer = (prevOpenPreview) => {
    const openPreview = !prevOpenPreview
    onPreviewVisibilityChange({ open: openPreview })
    return openPreview
  }
  const [openPreview, togglePreview] = useReducer(previewReducer, false)
  const [openSettings, setOpenSettings] = useState(false)

  const [initializing, setInitializing] = useState(false)

  const [paused, setPaused] = useState(false)
  const onClickPause = () => {
    const _pause = !paused
    APP.scene.emit("facetracking_action", _pause ? "pause" : "resume")
    setPaused(_pause)
  }

  /**
   * Event listeners
   */
  useEffect(() => {
    const onInitializing = () => setInitializing(true)
    const onInitialized = () => setInitializing(false)
    APP.scene.addEventListener("facetracking_initializing", onInitializing)
    APP.scene.addEventListener("facetracking_initialized", onInitialized)
    return () => {
      APP.scene.removeEventListener("facetracking_initializing", onInitializing)
      APP.scene.removeEventListener("facetracking_initialized", onInitialized)
    }
  }, [])

  useLayoutEffect(() => {
    canvasContainer.current.appendChild(canvasEl)
  }, [canvasEl])
  return (
    <>
      <div class="absolute bottom-0 right-0 mx-4 px-4 bg-white rounded-t-xl pointer-events-auto">
        <button class="flex fill-current text-hubs-gray justify-center w-full focus:outline-none" onClick={togglePreview}>
          <box-icon name={openPreview ? "chevron-down" : "chevron-up"}></box-icon>
        </button>
        <Collapsible open={openPreview}>
          <div ref={canvasContainer} class="mb-4" />
          <div class="flex justify-center gap-2 mb-4">
            <Button onClick={onClickPause}>
              <box-icon name={paused ? "play" : "pause"}></box-icon>
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button onClick={() => setOpenSettings(!openSettings)}>
              <box-icon name="slider-alt"></box-icon>
            </Button>
          </div>
        </Collapsible>
      </div>
      {openSettings && <SettingsPopup onClose={() => setOpenSettings(false)} onAction={onAction} />}
      {initializing && <Initializing />}
    </>
  )
}
