import { ref, type Ref } from 'vue'

import { parsePath, routeToPath, type Route } from './routes'

class Router {
  public readonly current: Ref<Route> = ref(parsePath(window.location.pathname))
  private started = false

  public start() {
    if (this.started) return
    this.started = true

    window.addEventListener('popstate', this.handleLocationChange)
    document.addEventListener('click', this.handleLinkClick)
  }

  public navigate(to: Route) {
    const path = routeToPath(to)

    if (window.location.pathname === path) {
      this.current.value = to
      return
    }

    window.history.pushState({ route: path }, '', path)
    this.current.value = to
  }

  public back() {
    window.history.back()
  }

  public forward() {
    window.history.forward()
  }

  private handleLocationChange = () => {
    this.current.value = parsePath(window.location.pathname)
  }

  private handleLinkClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const target = event.target
    if (!(target instanceof Element)) return

    const anchor = target.closest('a')
    if (!anchor) return
    if (anchor.target && anchor.target !== '_self') return
    if (anchor.hasAttribute('download')) return

    const href = anchor.getAttribute('href')
    if (!href || href.startsWith('#')) return

    const url = new URL(anchor.href, window.location.href)
    if (url.origin !== window.location.origin) return

    event.preventDefault()
    this.navigate(parsePath(url.pathname))
  }
}

const router = new Router()

export function useRoute() {
  return { route: router.current }
}

export { router }
