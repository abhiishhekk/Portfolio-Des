let lockCount = 0

export function isScrollLocked() {
  return lockCount > 0
}

export function lockScroll(options = {}) {
  const { forceTop = false } = options

  lockCount++

  if (typeof window !== 'undefined') {
    window.__lenis?.stop()

    document.documentElement.classList.add('scroll-locked')
    document.body.classList.add('scroll-locked')
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    if (forceTop) {
      window.scrollTo(0, 0)
    }
  }
}

export function unlockScroll() {
  if (lockCount <= 0) {
    lockCount = 0
    return
  }

  lockCount--

  if (lockCount === 0) {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('scroll-locked')
      document.body.classList.remove('scroll-locked')
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''

      window.__lenis?.start()
      window.__lenis?.resize()
    }
  }
}

