export function Initializing({ message, onCancel = () => {} }) {
  return (
    <div class="absolute w-full h-full grid place-items-center bg-black bg-opacity-30">
      <div class="bg-white rounded-xl p-8 relative w-[300px] max-w-xl grid place-items-center gap-2">
        <Spinner />
        <p class="text-xl font-semibold">Initializing</p>
        <p class="text-sm text-hubs-gray">{message}</p>
        <button onClick={onCancel} class="bg-hubs-pink hover:bg-hubs-lightpink text-white rounded px-3 py-2">
          Cancel
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return <div class="w-8 aspect-square border-4 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
}
