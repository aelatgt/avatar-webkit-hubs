import { useLayoutEffect, useRef } from "preact/hooks"

export function Collapsible({ children, open }) {
  const ref = useRef()
  useLayoutEffect(() => {
    ref.current.style.height = `${open ? ref.current.scrollHeight : 0}px`
  }, [ref, open])
  return (
    <div
      ref={ref}
      style={{
        overflow: "hidden",
        transition: "height 200ms ease-in-out",
      }}
    >
      {children}
    </div>
  )
}
