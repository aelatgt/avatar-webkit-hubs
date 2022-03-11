import { geometryBlendShapes } from "@/utils/blendshapes"
import { Button } from "./Button"

export function SettingsPopup({ onClose, onAction }) {
  return (
    <div class="absolute w-full h-full grid place-items-center bg-black bg-opacity-30">
      <div class="bg-white rounded-xl p-8 relative max-w-xl">
        <button class="absolute top-2 right-2" onClick={onClose}>
          <box-icon name="x"></box-icon>
        </button>
        <h1 class="text-xl mb-8 font-bold">Settings</h1>
        <p class="mt-8">
          To correct your avatar's head orientation, <b>look towards the center of your monitor</b> and click the button below.
        </p>
        <div class="my-2 flex justify-center">
          <Button onClick={() => onAction("calibrate_center")}>
            <box-icon name="target-lock"></box-icon>Recenter Head
          </Button>
        </div>
        <p class="mb-2 mt-8 text-xl font-bold">Aura calibration</p>
        <div class="my-2 flex justify-center gap-2">
          <Button onClick={() => onAction("calibrate_negative")}>
            <box-icon name="sad"></box-icon>
          </Button>
          <Button onClick={() => onAction("calibrate_neutral")}>
            <box-icon name="meh"></box-icon>
          </Button>
          <Button onClick={() => onAction("calibrate_positive")}>
            <box-icon name="happy"></box-icon>
          </Button>
        </div>
        <p class="mb-2 mt-8 text-xl font-bold">Shape intensities</p>
        <div class="max-h-72 overflow-y-scroll">
          <div class="grid grid-cols-2 max-w-sm gap-y-2 items-center my-2">
            {geometryBlendShapes.map((name) => (
              <>
                <label htmlFor={`${name}Calibration`}>{name}</label>
                <input
                  id={`${name}Calibration`}
                  type="range"
                  value={1}
                  min={0}
                  max={1}
                  step={0.01}
                  onInput={(e) => console.log(name, e.target.value)}
                />
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
