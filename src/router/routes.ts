export type Route =
  | { name: 'home' }
  | { name: 'lesson'; id: string }
  | { name: 'progress' }
  | { name: 'not-found'; path: string }

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '').split('?')[0] || '/'
  const path = raw.startsWith('/') ? raw : `/${raw}`

  if (path === '/') return { name: 'home' }
  if (path === '/progress') return { name: 'progress' }

  const lesson = /^\/lesson\/([\w-]+)\/?$/.exec(path)
  if (lesson) return { name: 'lesson', id: lesson[1] }

  return { name: 'not-found', path }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'lesson':
      return `#/lesson/${route.id}`
    case 'progress':
      return '#/progress'
    case 'not-found':
      return `#${route.path}`
  }
}

export function lessonHref(id: string): string {
  return `#/lesson/${id}`
}