import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { APP_ROUTE } from '@/constants/route'

// Constants for configuration
const AUTH_CONFIG = {
  COOKIE_NAMES: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
  },
  REDIRECT_QUERY_PARAMS: {
    LOGOUT: 'logout',
    REDIRECT_URL: 'redirectUrl',
    ERROR: 'error',
  },
  TOKEN_EXPIRY_BUFFER: 300, // 5 minutes in seconds
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
} as const

// Security headers configuration
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-XSS-Protection': '1; mode=block',
} as const

// Protected routes configuration with role requirements
const PROTECTED_ROUTES = [
  {
    path: APP_ROUTE.YOUR_BOOKINGS,
    roles: ['user', 'admin'] as string[],
    rateLimit: true,
  },
  {
    path: APP_ROUTE.PROFILE,
    roles: ['user', 'admin'] as string[],
    rateLimit: true,
  },
  {
    path: APP_ROUTE.PREFERENCE,
    roles: ['user', 'admin'] as string[],
    rateLimit: true,
  },
  {
    path: APP_ROUTE.NOTIFICATIONS,
    roles: ['user', 'admin'] as string[],
    rateLimit: true,
  },
  {
    path: APP_ROUTE.ADMIN,
    roles: ['admin'] as string[],
    rateLimit: true,
  },
] as const

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  APP_ROUTE.HOME,
  APP_ROUTE.LOGIN,
  '/api/auth',  // Auth-related API endpoints
  '/_next',     // Next.js assets
  '/static',    // Static files
  '/favicon.ico',
  '/manifest.json',
  '/icons',
] as const

/**
 * Check if a path matches any of the protected routes
 * @param pathname - The current pathname to check
 * @returns The matched route configuration or null
 */
function getProtectedRouteConfig(pathname: string) {
  return PROTECTED_ROUTES.find(route => pathname.startsWith(route.path)) || null
}

/**
 * Check if a path is a public route that doesn't require authentication
 * @param pathname - The pathname to check
 * @returns boolean indicating if the route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Parse and validate JWT token
 * @param token - The JWT token to validate
 * @returns Object containing validation result and decoded payload
 */
function validateToken(token: string): { 
  isValid: boolean; 
  payload: any; 
  error?: string 
} {
  try {
    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) {
      return { isValid: false, payload: null, error: 'Invalid token format' }
    }

    const decodedPayload = JSON.parse(atob(payload))
    const currentTime = Math.floor(Date.now() / 1000)

    // Check token expiration with buffer time
    if (decodedPayload.exp && 
        decodedPayload.exp - AUTH_CONFIG.TOKEN_EXPIRY_BUFFER < currentTime) {
      return { isValid: false, payload: decodedPayload, error: 'Token expired or expiring soon' }
    }

    return { isValid: true, payload: decodedPayload }
  } catch (error) {
    return { isValid: false, payload: null, error: 'Token validation failed' }
  }
}

/**
 * Extract user roles from JWT token
 * @param token - The JWT token to extract roles from
 * @returns Array of user roles
 */
function extractUserRoles(token: string): string[] {
  const { payload } = validateToken(token)
  return payload?.roles || []
}

/**
 * Check if user has required roles for a route
 * @param userRoles - Array of user roles
 * @param requiredRoles - Array of required roles for the route
 * @returns boolean indicating if user has required roles
 */
function hasRequiredRoles(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role))
}

/**
 * Create a redirect response with enhanced security headers
 * @param request - The incoming request
 * @param destination - The destination URL
 * @param options - Additional options for the redirect
 * @returns NextResponse with redirect and security headers
 */
function createRedirectResponse(
  request: NextRequest, 
  destination: string,
  options: { error?: string; preserveQuery?: boolean } = {}
): NextResponse {
  const url = new URL(destination, request.url)
  
  // Preserve original URL for redirect after login
  url.searchParams.set(
    AUTH_CONFIG.REDIRECT_QUERY_PARAMS.REDIRECT_URL, 
    options.preserveQuery ? request.url : request.nextUrl.pathname
  )

  // Add error message if provided
  if (options.error) {
    url.searchParams.set(AUTH_CONFIG.REDIRECT_QUERY_PARAMS.ERROR, options.error)
  }

  const response = NextResponse.redirect(url)
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Create an error response with security headers
 * @param status - HTTP status code
 * @param message - Error message
 * @returns NextResponse with error details and security headers
 */
function createErrorResponse(status: number, message: string): NextResponse {
  const response = NextResponse.json(
    { error: message },
    { status, statusText: message }
  )

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Check rate limit for a request
 * @param request - The incoming request
 * @returns boolean indicating if request should be rate limited
 */
function shouldRateLimit(request: NextRequest): boolean {
  // This is a basic implementation. In production, use a proper rate limiting service
  // like Redis to track requests across multiple instances
  const clientIp = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') ||
                  'unknown'
  const key = `rate-limit:${clientIp}`
  
  // In production, implement proper rate limiting here
  return false // Placeholder return
}

/**
 * Middleware function for handling authentication and authorization
 * @param request - The incoming request
 * @returns NextResponse
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Get authentication tokens
  const accessToken = request.cookies.get(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN)?.value
  const refreshToken = request.cookies.get(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN)?.value

  // Redirect to login if no access token
  if (!accessToken) {
    return createRedirectResponse(request, APP_ROUTE.LOGIN, {
      error: 'Authentication required',
      preserveQuery: true
    })
  }

  // Validate access token
  const { isValid, error } = validateToken(accessToken)
  if (!isValid) {
    // Token is invalid or expired
    if (error === 'Token expired or expiring soon' && refreshToken) {
      // In production, implement token refresh logic here
      // For now, redirect to login
      return createRedirectResponse(request, APP_ROUTE.LOGIN, {
        error: 'Session expired',
        preserveQuery: true
      })
    }
    
    return createRedirectResponse(request, APP_ROUTE.LOGIN, {
      error: 'Invalid session',
      preserveQuery: true
    })
  }

  // Check rate limiting for protected routes
  const protectedRoute = getProtectedRouteConfig(pathname)
  if (protectedRoute?.rateLimit && shouldRateLimit(request)) {
    return createErrorResponse(429, 'Too many requests')
  }

  // Check role-based access for protected routes
  if (protectedRoute) {
    const userRoles = extractUserRoles(accessToken)
    if (!hasRequiredRoles(userRoles, protectedRoute.roles)) {
      return createRedirectResponse(request, APP_ROUTE.HOME, {
        error: 'Access denied'
      })
    }
  }

  // Handle login page access when already authenticated
  if (pathname === APP_ROUTE.LOGIN && accessToken) {
    return createRedirectResponse(request, APP_ROUTE.HOME)
  }

  // Add security headers to the response
  const response = NextResponse.next()
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Configure middleware matching
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     * 4. public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|icons/).*)',
  ],
}
