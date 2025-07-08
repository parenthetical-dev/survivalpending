// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

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
      
      // Copy init properties
      Object.keys(init).forEach(key => {
        this[key] = init[key]
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
      this.headers = new Map(Object.entries(init.headers || {}))
      
      this.json = async () => {
        if (typeof body === 'string') {
          return JSON.parse(body)
        }
        return body
      }
      this.text = async () => String(body)
      this.clone = () => new Response(body, init)
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

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
}))