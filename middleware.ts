import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { APP_ROUTE } from '@/constants/route'

const AUTH = {
  COOKIE: {
    ACCESS: 'accessToken',
    REFRESH: 'refreshToken',
  },
  QUERY: {
    LOGOUT: 'logout',
    REDIRECT_URL: 'redirectUrl',
    ERROR: 'error',
  },
  TOKEN_EXPIRY_BUFFER_SEC: 300,
}

const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-XSS-Protection': '1; mode=block',
}

const PROTECTED_ROUTES = [
  { path: APP_ROUTE.YOUR_BOOKINGS, roles: ['user', 'admin'], rateLimit: true },
  { path: APP_ROUTE.PROFILE, roles: ['user', 'admin'], rateLimit: true },
  { path: APP_ROUTE.PREFERENCE, roles: ['user', 'admin'], rateLimit: true },
  { path: APP_ROUTE.NOTIFICATIONS, roles: ['user', 'admin'], rateLimit: true },
  { path: APP_ROUTE.ADMIN, roles: ['admin'], rateLimit: true },
]

const PUBLIC_ROUTES = [
  APP_ROUTE.HOME,
  APP_ROUTE.LOGIN,
  '/api/auth',
  '/_next',
  '/static',
  '/favicon.ico',
  '/manifest.json',
  '/icons',
]

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

function getProtectedConfig(pathname: string) {
  return PROTECTED_ROUTES.find(r => pathname.startsWith(r.path)) || null
}

function decodeTokenPayload(token: string): any | null {
  try {
    const payload = token.split('.')[1]
    return payload ? JSON.parse(atob(payload)) : null
  } catch {
    return null
  }
}

function validateAccessToken(token: string): { isValid: boolean; payload: any; error?: string } {
  const payload = decodeTokenPayload(token)
  const now = Math.floor(Date.now() / 1000)

  if (!payload || !payload.exp) {
    return { isValid: false, payload, error: 'Invalid token format' }
  }

  const isExpiring = payload.exp - AUTH.TOKEN_EXPIRY_BUFFER_SEC < now
  if (isExpiring) {
    return { isValid: false, payload, error: 'Token expired or expiring soon' }
  }

  return { isValid: true, payload }
}

function hasRequiredRoles(userRoles: string[], required: string[]): boolean {
  return required.some(role => userRoles.includes(role))
}

function addSecurityHeaders(response: NextResponse): void {
  Object.entries(SECURITY_HEADERS).forEach(([key, val]) => {
    response.headers.set(key, val)
  })
}

function redirectTo(
  request: NextRequest,
  destination: string,
  opts: { error?: string; preserveQuery?: boolean } = {}
): NextResponse {
  const url = new URL(destination, request.url)
  url.searchParams.set(
    AUTH.QUERY.REDIRECT_URL,
    opts.preserveQuery ? request.url : request.nextUrl.pathname
  )
  if (opts.error) {
    url.searchParams.set(AUTH.QUERY.ERROR, opts.error)
  }

  const response = NextResponse.redirect(url)
  addSecurityHeaders(response)
  return response
}

function jsonError(status: number, message: string): NextResponse {
  const response = NextResponse.json({ error: message }, { status })
  addSecurityHeaders(response)
  return response
}

function shouldRateLimit(_: NextRequest): boolean {
  // TODO: Replace with real rate limiter (e.g. Redis)
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublic(pathname)) return NextResponse.next()

  const accessToken = request.cookies.get(AUTH.COOKIE.ACCESS)?.value
  const refreshToken = request.cookies.get(AUTH.COOKIE.REFRESH)?.value

  if (!accessToken) {
    return redirectTo(request, APP_ROUTE.LOGIN, {
      error: 'Authentication required',
      preserveQuery: true,
    })
  }

  const { isValid, payload, error } = validateAccessToken(accessToken)
  if (!isValid) {
    if (error === 'Token expired or expiring soon' && refreshToken) {
      // Optional: Refresh logic could go here
    }
    return redirectTo(request, APP_ROUTE.LOGIN, {
      error: 'Invalid or expired session',
      preserveQuery: true,
    })
  }

  const protectedRoute = getProtectedConfig(pathname)
  if (protectedRoute) {
    if (protectedRoute.rateLimit && shouldRateLimit(request)) {
      return jsonError(429, 'Too many requests')
    }

    const roles = payload?.roles ?? []
    if (!hasRequiredRoles(roles, protectedRoute.roles)) {
      return redirectTo(request, APP_ROUTE.HOME, { error: 'Access denied' })
    }
  }

  if (pathname === APP_ROUTE.LOGIN) {
    return redirectTo(request, APP_ROUTE.HOME)
  }

  const response = NextResponse.next()
  addSecurityHeaders(response)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|icons/).*)',
  ],
}
