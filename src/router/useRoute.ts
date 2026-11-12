import { ref } from 'vue'

import { parseHash, routeToHash, type Route } from './routes'

const route = ref<Route>(parseHash(window.location.hash))
let listening = false

function handleHashChange() {
  route.value = parseHash(window.location.hash)
}

export function useRoute() {
  if (!listening) {
    listening = true
    window.addEventListener('hashchange', handleHashChange)
  }

  return { route }
}

export function navigate(to: Route) {
  const hash = routeToHash(to)

  if (window.location.hash === hash) {
    route.value = to
    return
  }

  window.location.hash = hash
}