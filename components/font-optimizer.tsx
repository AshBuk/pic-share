"use client"

import { useEffect } from 'react'

export function FontOptimizer() {
  useEffect(() => {
    // Force immediate font usage to prevent preload warnings
    const style = document.createElement('style')
    style.textContent = `
      .font-preload-fix {
        font-family: var(--font-sans), system-ui, sans-serif;
        font-family: var(--font-mono), monospace;
        visibility: hidden;
        position: absolute;
        left: -9999px;
      }
    `
    document.head.appendChild(style)

    const testDiv = document.createElement('div')
    testDiv.className = 'font-preload-fix'
    testDiv.textContent = 'Font loading test'
    document.body.appendChild(testDiv)

    // Clean up
    return () => {
      document.head.removeChild(style)
      document.body.removeChild(testDiv)
    }
  }, [])

  return null
}