// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import React from 'react'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test'
process.env.JWT_SECRET = 'test-secret'
process.env.GROQ_API_KEY = 'test-groq-key'
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
process.env.ELEVENLABS_API_KEY = 'test-elevenlabs-key'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))


// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  const actualNext = jest.requireActual('next/server')
  
  class MockNextRequest {
    constructor(input, init = {}) {
      const url = typeof input === 'string' ? input : input.url
      this.url = url
      this.method = init.method || 'GET'
      this.headers = new Map()
      
      if (init.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value)
        })
      }
      
      this._body = init.body || null
      
      this.json = async () => {
        if (typeof this._body === 'string') {
          return JSON.parse(this._body)
        }
        return this._body
      }
      
      this.text = async () => String(this._body)
      this.arrayBuffer = async () => new ArrayBuffer(0)
      this.blob = async () => new Blob()
      this.formData = async () => new FormData()
      this.clone = () => new MockNextRequest(url, init)
    }
  }
  
  class MockNextResponse extends Response {
    constructor(body, init = {}) {
      super(body, init)
      this._cookies = new Map()
      
      this.cookies = {
        set: (name, value, options = {}) => {
          this._cookies.set(name, { value, options })
          const cookieString = `${name}=${value}; ${Object.entries(options)
            .map(([k, v]) => {
              if (k === 'maxAge') return `Max-Age=${v}`
              if (k === 'httpOnly' && v) return 'HttpOnly'
              if (k === 'secure' && v) return 'Secure'
              if (k === 'sameSite') return `SameSite=${v}`
              if (k === 'path') return `Path=${v}`
              return ''
            })
            .filter(Boolean)
            .join('; ')}`
          this.headers.set('set-cookie', cookieString)
        },
        get: (name) => this._cookies.get(name),
        delete: (name) => {
          this._cookies.delete(name)
          this.cookies.set(name, '', { maxAge: 0 })
        }
      }
    }
    
    static json(data, init = {}) {
      const response = new MockNextResponse(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers || {})
        }
      })
      return response
    }
  }
  
  return {
    ...actualNext,
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  }
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})


// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}


// Suppress console errors in tests unless explicitly testing them
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || 
       args[0].includes('Error:') ||
       args[0].includes('Not implemented: navigation'))
    ) {
      return
    }
    // Also suppress errors that are objects with navigation error
    if (args[0] && typeof args[0] === 'object' && args[0].type === 'not implemented') {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Add missing Node.js globals for tests
if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = class Request {
    constructor(input, init = {}) {
      // Handle URL object or string
      const url = typeof input === 'string' ? input : input.url
      
      // Create properties that Next.js expects
      Object.defineProperty(this, 'url', {
        value: url,
        writable: false,
        enumerable: true,
        configurable: true
      })
      
      // Add headers with proper methods
      this.headers = new Map()
      if (init.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value)
        })
      }
      this.headers.append = function(name, value) {
        this.set(name.toLowerCase(), value)
      }
      this.headers.get = function(name) {
        return Map.prototype.get.call(this, name.toLowerCase())
      }
      this.headers.has = function(name) {
        return Map.prototype.has.call(this, name.toLowerCase())
      }
      
      // Copy init properties
      Object.keys(init).forEach(key => {
        if (key !== 'headers') {
          this[key] = init[key]
        }
      })
      
      // Add required methods
      this.clone = () => new Request(url, init)
      this.json = async () => JSON.parse(init.body)
      this.text = async () => init.body
      this.arrayBuffer = async () => new ArrayBuffer(0)
      this.blob = async () => new Blob()
      this.formData = async () => new FormData()
    }
  }
}

if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.ok = init.status >= 200 && init.status < 300
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      // Create a proper Headers object
      this.headers = new Map(Object.entries(init.headers || {}))
      this.headers.append = function(name, value) {
        this.set(name.toLowerCase(), value)
      }
      this.headers.get = function(name) {
        return Map.prototype.get.call(this, name.toLowerCase())
      }
      this.headers.has = function(name) {
        return Map.prototype.has.call(this, name.toLowerCase())
      }
      
      this.json = async () => {
        if (typeof body === 'string') {
          return JSON.parse(body)
        }
        return body
      }
      this.text = async () => String(body)
      this.clone = () => new Response(body, init)
    }
    
    // Add static json method for NextResponse.json()
    static json(data, init = {}) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers || {})
        }
      })
    }
  }
}

if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = require('util').TextDecoder
}

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = require('util').TextEncoder
}

// Mock fetch for tests
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = jest.fn()
}

// Add clearImmediate for undici
if (typeof globalThis.clearImmediate === 'undefined') {
  globalThis.clearImmediate = (id) => clearTimeout(id)
}

// Mock performance.markResourceTiming for undici
if (typeof globalThis.performance === 'undefined') {
  globalThis.performance = {
    now: Date.now,
    markResourceTiming: jest.fn(),
  }
} else if (!globalThis.performance.markResourceTiming) {
  globalThis.performance.markResourceTiming = jest.fn()
}

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
}))

// Mock Meta CAPI
jest.mock('@/lib/meta-capi', () => ({
  trackPageView: jest.fn().mockResolvedValue(undefined),
  trackViewContent: jest.fn().mockResolvedValue(undefined),
  trackInitiateCheckout: jest.fn().mockResolvedValue(undefined),
  trackCompleteRegistration: jest.fn().mockResolvedValue(undefined),
  trackStartTrial: jest.fn().mockResolvedValue(undefined),
}))

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  captureEvent: jest.fn(),
  captureConsoleIntegration: jest.fn(),
  captureRouterTransitionStart: jest.fn(),
  init: jest.fn(),
  replayIntegration: jest.fn(),
}))

// Mock Turnstile component
jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }) => {
    // Automatically call onSuccess with a test token in tests
    React.useEffect(() => {
      if (onSuccess) {
        onSuccess('test-turnstile-token');
      }
    }, [onSuccess]);
    
    return React.createElement('div', {
      'data-testid': 'turnstile-widget',
      className: 'cf-turnstile',
    });
  },
}))