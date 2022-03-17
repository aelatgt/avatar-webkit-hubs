import { useState } from "preact/hooks"
import { Button } from "./Button"

export function SettingsPopup({ onClose, onAction, initialRange }) {
  const [range, setRange] = useState(initialRange)
  const labels = ["Negative", "Neutral", "Positive"]
  const setRangeItem = (i, value) => {
    let newRange = [...range]
    newRange[i] = Number(value)
    onAction({ type: "set_range", payload: newRange })
    setRange(newRange)
  }
  return (
    <div class="absolute w-full h-full p-8 grid place-items-center bg-black bg-opacity-30">
      <div class="bg-white rounded-xl p-8 relative max-w-xl overflow-hidden">
        <div class="flex flex-col">
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
          <p class="mb-4 mt-8 text-xl font-bold">Expression Adjustment</p>
          <div class="grid grid-cols-[auto_1fr_auto] gap-x-5 gap-y-2 items-center">
            {Array(3)
              .fill()
              .map((_, i) => (
                <>
                  <label class="flex gap-6 items-center">{labels[i]}</label>
                  <input
                    class="w-80"
                    type="range"
                    value={range[i]}
                    min={-2}
                    max={2}
                    step={0.1}
                    onInput={(e) => setRangeItem(i, e.target.value)}
                  />
                  <p class="w-8 flex justify-center">{range[i]}</p>
                </>
              ))}
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
        </div>
      </div>
    </div>
  )
}
