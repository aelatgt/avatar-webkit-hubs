import { useState } from "preact/hooks"
import { Button } from "./Button"

export function SettingsPopup({ onClose, onAction, initialIntensities }) {
  const [intensities, setIntensities] = useState(initialIntensities)
  const setIntensity = (name, intensity) => {
    const newIntensities = { ...intensities, [name]: intensity }
    onAction({ type: "set_intensities", payload: intensities })
    setIntensities(newIntensities)
  }
  return (
    <div class="absolute w-full h-full p-8 grid place-items-center bg-black bg-opacity-30">
      <div class="bg-white rounded-xl p-8 relative max-w-xl h-full overflow-hidden">
        <div class="flex flex-col overflow-y-auto h-full">
          <button class="absolute top-2 right-2" onClick={onClose}>
            <box-icon name="x"></box-icon>
          </button>
          <h1 class="text-xl mb-8 font-bold">Settings</h1>
          <p class="mt-8">
            To correct your avatar's head orientation, <b>look towards the center of your monitor</b> and click the button below.
          </p>
          <div class="my-2 flex justify-center">
            <Button onClick={() => onAction({ type: "calibrate_center" })}>
              <box-icon name="target-lock"></box-icon>Recenter Head
            </Button>
          </div>
          <p class="mb-2 mt-8 text-xl font-bold">Aura calibration</p>
          <div class="my-2 flex justify-center gap-2">
            <Button onClick={() => onAction({ type: "calibrate_negative" })}>
              <box-icon name="sad"></box-icon>
            </Button>
            <Button onClick={() => onAction({ type: "calibrate_neutral" })}>
              <box-icon name="meh"></box-icon>
            </Button>
            <Button onClick={() => onAction({ type: "calibrate_positive" })}>
              <box-icon name="happy"></box-icon>
            </Button>
          </div>
          <p class="mb-2 mt-8 text-xl font-bold">Shape intensities</p>
          <div class="grid grid-cols-2 max-w-sm gap-y-2 items-center my-2">
            {Object.keys(intensities).map((name) => (
              <>
                <label htmlFor={`${name}Calibration`}>{name}</label>
                <input
                  id={`${name}Calibration`}
                  type="range"
                  value={intensities[name]}
                  min={0}
                  max={1}
                  step={0.01}
                  onInput={(e) => setIntensity(name, e.target.value)}
                />
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
