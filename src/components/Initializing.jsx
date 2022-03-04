export function Initializing() {
  return (
    <div class="absolute w-full h-full grid place-items-center bg-black bg-opacity-30">
      <div class="bg-white rounded-xl p-8 relative max-w-xl grid place-items-center gap-2">
        <Spinner />
        <p class="text-xl font-semibold">Initializing</p>
      </div>
    </div>
  )
}

function Spinner() {
  return <div class="w-8 aspect-square border-4 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
}
