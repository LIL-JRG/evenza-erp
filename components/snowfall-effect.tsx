'use client'

import { useEffect, useRef } from 'react'

export default function SnowfallEffect() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupFunctionsRef = useRef<Array<() => void>>([])
  const activeSnowflakesRef = useRef(0)
  const MAX_SNOWFLAKES = 50 // Límite de snowflakes activos

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function createSnowflake() {
      if (!container || activeSnowflakesRef.current >= MAX_SNOWFLAKES) return

      const containerRect = container.getBoundingClientRect()
      const snowflake = document.createElement('div')
      snowflake.className = 'snowflake'
      snowflake.style.cssText = `
        position: absolute;
        left: ${Math.random() * containerRect.width}px;
        top: -5px;
        width: 4px;
        height: 4px;
        background-color: white;
        opacity: ${Math.random()};
        transform: scale(${Math.random() * 1.5 + 0.5});
        pointer-events: none;
        z-index: 10;
        border-radius: 50%;
      `

      container.appendChild(snowflake)
      activeSnowflakesRef.current++

      let posY = -5
      let speed = Math.random() * 2 + 1
      let wobble = 0
      let animationId: number | null = null
      let isActive = true

      function cleanup() {
        if (!isActive) return
        isActive = false

        if (animationId !== null) {
          cancelAnimationFrame(animationId)
          animationId = null
        }

        if (snowflake.parentNode) {
          snowflake.remove()
        }

        activeSnowflakesRef.current--

        // Remove cleanup function from array
        const index = cleanupFunctionsRef.current.indexOf(cleanup)
        if (index > -1) {
          cleanupFunctionsRef.current.splice(index, 1)
        }
      }

      function fall() {
        if (!container || !isActive) {
          cleanup()
          return
        }

        const containerRect = container.getBoundingClientRect()
        posY += speed
        wobble += 0.02
        snowflake.style.top = posY + 'px'
        snowflake.style.left =
          parseFloat(snowflake.style.left) + Math.sin(wobble) * 2 + 'px'

        if (posY < containerRect.height) {
          animationId = requestAnimationFrame(fall)
        } else {
          cleanup()
        }
      }

      // Start animation
      animationId = requestAnimationFrame(fall)

      // Store cleanup function
      cleanupFunctionsRef.current.push(cleanup)
    }

    // Generate snowflakes
    const interval = setInterval(createSnowflake, 150) // Reducido de 100ms a 150ms

    // Cleanup on unmount
    return () => {
      clearInterval(interval)

      // Call all cleanup functions
      cleanupFunctionsRef.current.forEach(cleanup => cleanup())
      cleanupFunctionsRef.current = []

      // Remove all remaining snowflakes
      const snowflakes = container.querySelectorAll('.snowflake')
      snowflakes.forEach(flake => flake.remove())

      activeSnowflakesRef.current = 0
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 10 }}
    />
  )
}
