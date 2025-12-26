'use client'

import { useEffect, useRef } from 'react'

export default function SnowfallEffect() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function createSnowflake() {
      if (!container) return

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

      let posY = -5
      let speed = Math.random() * 2 + 1
      let wobble = 0
      let animationId: number

      function fall() {
        if (!container) {
          snowflake.remove()
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
          snowflake.remove()
        }
      }

      fall()

      // Return cleanup function
      return () => {
        cancelAnimationFrame(animationId)
        snowflake.remove()
      }
    }

    // Generate snowflakes
    const interval = setInterval(createSnowflake, 100)

    // Cleanup on unmount
    return () => {
      clearInterval(interval)
      // Remove all snowflakes
      const snowflakes = container.querySelectorAll('.snowflake')
      snowflakes.forEach(flake => flake.remove())
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
