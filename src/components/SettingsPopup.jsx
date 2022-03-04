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
        <p class="mt-8">
          To calibrate your avatar's neutral facial expression,{" "}
          <b>adjust your real-world facial expression until the avatar preview appears neutral</b>, then click the button below.
        </p>
        <div class="my-2 flex justify-center">
          <Button onClick={() => onAction("calibrate_neutral")}>
            <box-icon name="meh"></box-icon>Calibrate
          </Button>
        </div>
      </div>
    </div>
  )
}
