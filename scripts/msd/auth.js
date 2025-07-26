/* ──────────────────────────────────────── Web Crypto  ──────────────────────────────────────── */
/*
 * this code locks the crypto module from being tampered with / polyfilled. This script should be run before any extern imports are.
 */

if (!crypto?.getRandomValues || !crypto.subtle) {
  throw new Error('Web Crypto unavailable – refuse to run')
}
const safeGetRandomValues = crypto.getRandomValues.bind(crypto)
const safeDigest = crypto.subtle.digest.bind(crypto.subtle)
// const safeUUID = crypto.randomUUID;

Object.freeze(crypto)
Object.freeze(Object.getPrototypeOf(crypto))
Object.freeze(crypto.subtle)
Object.freeze(Object.getPrototypeOf(crypto.subtle))

/* ──────────────────────────────────────── PKCE  ──────────────────────────────────────── */

// refernce code https://github.com/crouchcd/pkce-challenge/blob/master/src/index.ts

/** Generate cryptographically strong random string
 * @param {number} size The desired length of the string
 * @returns {string} The random string
 */
const generateVerifier = (size) => {
  const mask =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~'
  let result = ''
  const randomUints = safeGetRandomValues(new Uint8Array(size))
  for (let i = 0; i < size; i++) {
    // cap the value of the randomIndex to mask.length - 1
    const randomIndex = randomUints[i] % mask.length
    result += mask[randomIndex]
  }
  return result
}

/** @param {string} code_verifier */
const generateChallenge = async (code_verifier) => {
  const buffer = await safeDigest(
    'SHA-256',
    new TextEncoder().encode(code_verifier),
  )
  // Generate base64url string
  // btoa is deprecated in Node.js but is used here for web browser compatibility
  // (which has no good replacement yet, see also https://github.com/whatwg/html/issues/6811)
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
    .replace(/=/g, '')
}

/** Generate a PKCE challenge pair
 * @param {number} length Length of the verifier (between 43-128). Defaults to 43.
 * @returns {Promise<{code_verifier: string, code_challenge: string}>} PKCE challenge pair
 */
const pkceChallenge = async (length = 43) => {
  if (!length) length = 43
  if (length < 43 || length > 128) {
    throw `Expected a length between 43 and 128. Received ${length}.`
  }
  const verifier = generateVerifier(length)
  const challenge = await generateChallenge(verifier)
  return {
    code_verifier: verifier,
    code_challenge: challenge,
  }
}

/**
 * Build an OAuth 2.0 / PKCE **authorization URL** and its
 * matching verifier for later token exchange.
 *
 * @param {Object} params
 * @param {string} params.authEndpoint – Absolute `/authorize` endpoint.
 * @param {string} params.redirectUri  – Registered redirect URI.
 * @param {string} params.clientId     – Public client ID.
 * @param {string} params.profile      – Azure B2C policy or tenant profile.
 * @param {string} params.code_challenge – PKCE code challenge.
 * @param {string[]} params.claims     – Optional claims.
 * @returns {string}
 */
const buildAuthorizationUrl = ({
  authEndpoint,
  redirectUri,
  clientId,
  profile,
  code_challenge,
  claims,
}) => {
  const params = new URLSearchParams()

  if (profile) params.set('p', profile)

  if (claims && Array.isArray(claims)) {
    for (const claim of claims) {
      params.append('claims', claim)
    }
  }

  params.set('client_id', clientId)
  params.set('redirect_uri', redirectUri)
  params.set('response_type', 'code')
  params.set('scope', 'openid offline_access')
  params.set('nonce', 'defaultNonce')
  params.set('code_challenge', code_challenge)
  params.set('code_challenge_method', 'S256')
  params.set('prompt', 'login')

  return `${authEndpoint}?${params}`
}

/* ──────────────────────────────────────── helpers  ──────────────────────────────────────── */

/** @param {unknown} v */
const isString = (v) => typeof v === 'string' && v.length > 0

/**
 * @param {any} v
 * @param {string} msg error message
 * @throws {Error}
 */
const assertString = (v, msg) => {
  if (!isString(v)) throw new Error(msg)
}

/* ──────────────────────────────────────── Locking  ──────────────────────────────────────── */

const TAB_ID = crypto.randomUUID()

/**
 * Acquire a **per-tab or per-origin mutex**, run `fn`, then release.
 * Falls back to a localStorage polyfill if the Web Locks API
 * is absent (e.g. Safari ≤ 16).
 *
 * @param {Object} [opts]
 * @param {string}  [opts.name]              Lock identifier.
 * @param {boolean} [opts.ifAvailable=false] Whether to acquire the lock if it's already held.
 * @param {number}  [opts.maxAge=15000]      Polyfill only: lock expiry (ms).
 * @param {number}  [opts.maxWait=30000]     Polyfill only: wait timeout (ms).
 * @param {number}  [opts.poll=100]          Polyfill only: polling interval (ms).
 * @param {<T=any>() => (T|Promise<T>)} fn   Critical-section callback.
 * @returns {Promise<ReturnType<fn>|undefined>}
 */
const withLock = async (opts = {}, fn) => {
  opts = {
    name: '',
    ifAvailable: false,
    maxAge: 15_000,
    maxWait: 30_000,
    poll: 100,
    ...opts,
  }
  /* ——— native Web Locks API when it exists ——— */
  if (navigator?.locks?.request) {
    if (opts.ifAvailable) {
      return navigator.locks.request(opts.name, { ifAvailable: true }, fn)
    } else if (!opts.maxWait) {
      return navigator.locks.request(opts.name, fn)
    }
    return navigator.locks.request(
      opts.name,
      { signal: AbortSignal.timeout(opts.maxWait) },
      fn,
    )
  }

  /* ——— localStorage polyfill otherwise ——— */
  const key = `__lock_${opts.name}`

  const isFree = () => {
    const value = localStorage.getItem(key)
    if (!value) return true

    const [expiry, holder] = value.split(':')
    if (holder === TAB_ID) return true // we already own it
    return Number(expiry) < Date.now() // stale lock?
  }

  const claim = () =>
    localStorage.setItem(key, `${Date.now() + opts.maxAge}:${TAB_ID}`)

  const release = () => {
    const value = localStorage.getItem(key)
    if (!value) return
    const [, holder] = value.split(':')
    if (holder === TAB_ID) localStorage.removeItem(key)
  }

  if (!isFree()) {
    // match Web Locks API
    if (opts.ifAvailable) return undefined
    const deadline = Date.now() + opts.maxWait
    while (!isFree()) {
      if (Date.now() >= deadline) {
        console.log(`Lock timed out ${key}`)
        return undefined // timed out
      }
      await new Promise((r) => setTimeout(r, opts.poll))
    }
  }

  claim()

  try {
    return await fn()
  } finally {
    release()
  }
}

/* ──────────────────────────────────────── OAuth PKCE  ──────────────────────────────────────── */

/* ──────────────────────────────────────── user-info  ──────────────────────────────────────── */

const DEFAULT_INFO = Object.freeze({ userID: '', refreshBy: 0 })

/** @param {string} name */
const readCookie = (name) =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null

/** @param {string} name */
const clearCookie = (name) =>
  (document.cookie = `${name}=; Path=/; Secure; SameSite=Strict; Max-Age=0`)

const userInfo = {
  /** @returns {{userID:string, refreshBy:number}} */
  read() {
    const raw = readCookie('user_info')
    if (!raw) return DEFAULT_INFO
    try {
      const { cn = '', rb = 0 } = JSON.parse(atob(raw))
      return {
        userID: cn,
        refreshBy: Number.isFinite(rb) ? rb * 1000 : 0, // sec → ms
      }
    } catch (err) {
      console.error('Failed to parse user_info cookie:', err)
      return DEFAULT_INFO
    }
  },

  clear() {
    clearCookie('user_info')
  },
}

/* ──────────────────────────────────────── backend  ───────────────────────────────────────── */
const MIME = Object.freeze({
  TEXT: 'text/plain',
  JSON: 'application/json',
})
const NO_BODY_STATUS = Object.freeze(new Set([204, 205, 304]))

/**
 * @description Creates a backend client for calling APIs.
 * @param {string} origin  – fully-qualified URL such as "https://api.example.com"
 */
const createBackend = (origin) => {
  assertString(origin, 'createBackend: origin is required')

  /** Decode an HTTP Response
   * @param {Response} resp
   * @returns {Promise<{type:string, data:any, error?:Error}>}
   */
  const decode = async (resp) => {
    const ct = resp.headers.get('content-type') ?? ''

    if (ct === '' || NO_BODY_STATUS.has(resp.status))
      return { type: 'empty', data: null }

    if (ct.includes(MIME.JSON)) {
      try {
        return { type: 'json', data: await resp.json() }
      } catch (error) {
        return { type: 'json', data: null, error }
      }
    }

    if (ct.includes(MIME.TEXT)) return { type: 'text', data: await resp.text() }

    return { type: 'unhandled', data: null }
  }

  /** @param {string} uri @param {unknown} body */
  const post = async (uri, body = null) => {
    const resp = await fetch(new URL(uri, origin), {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      ...(body != null && { body: JSON.stringify(body) }),
    })

    const { data, type } = await decode(resp)
    return {
      uri,
      status: resp.status,
      ok: resp.ok,
      body: data,
      bodyType: type,
    }
  }

  // This lock is for:
  // Edge-Case: If both check() and exchange() are in flight at the same time
  // and exchange responses first with new cookies, and then check responses
  // setting cookies is will destroy the new tokens.
  const LOCK = 'sessionBackend'

  /* ---- public API ---- */
  return {
    logout: () => post('/session/logout'),

    check: () =>
      withLock({ name: LOCK, ifAvailable: true }, async (lock) => {
        if (!lock) return undefined
        return await post('/session/check')
      }),

    exchangeCodeForCookies: ({ code, code_verifier }) =>
      withLock({ name: LOCK, maxWait: 30_000 }, async (lock) => {
        if (!lock) return undefined
        return await post('/session/exchange', { code, code_verifier })
      }),
  }
}

/* ───────────────────────── AuthClient ───────────────────────── */

/**
 * Simple cross-tab messenger.
 *   const bus = makeMessenger("my-app");
 *   bus.on(msg => console.log("got", msg));
 *   bus.post({ type: "PING" });
 */
const makeChannel = (channelName = 'default-channel') => {
  if (typeof window.BroadcastChannel === 'function') {
    /* Native, modern path — Chrome 54+, Edge 79+, Firefox 38+, Safari 15.4+ */
    const id = crypto.randomUUID()
    const bc = new BroadcastChannel(channelName)
    const post = (msg) => bc.postMessage({ sender: id, msg })
    const on = (fn) =>
      bc.addEventListener('message', (e) => {
        if (e.data.sender === id) return
        fn(e.data)
      })

    return { post, on, close: () => bc.close(), id }
  }
  // ✱ Optional fallback; here we just no-op.
  console.warn('BroadcastChannel not supported in this browser')
  const noop = () => {}
  return { post: noop, on: noop, close: noop }
}

/**
 * @typedef {Object} AuthClient
 * @property {() => Promise<string>}            loginUrl
 * @property {(p: {code: string}) => Promise<any>} exchange
 * @property {() => Promise<void>}              logout
 * @property {() => {isAuthenticated: boolean, userID: string, refreshBy: number}} status
 * @property {(fn: Function) => void}           onAuthenticatedChange
 * @property {(fn: Function) => void}           removeAuthenticatedChange
 * @property {() => void}                       start
 * @property {() => void}                       stop
 */

/**
 * Creates a browser-side OAuth/PKCE auth-client that
 *  • builds the login URL
 *  • exchanges the code for cookies
 *  • keeps the session alive across tabs
 *  • exposes reactive auth-state helpers
 *
 * @typedef {Object} AuthOptions
 * @property {string} authEndpoint
 * @property {string} redirectUri
 * @property {string} clientId
 * @property {string} profile
 * @property {string} [origin]
 * @property {[string]} [claims]
 * @param {Partial<AuthOptions>} [options={}]  All keys optional at the call-site;
 *                                             run-time checks inside the function
 *                                             enforce that the four critical ones
 *                                             are actually provided.
 * @returns {AuthClient}
 */
const createAuthClient = ({
  authEndpoint,
  redirectUri,
  clientId,
  profile,
  origin = window.location.origin,
  claims,
} = {}) => {
  // Validate required strings
  ;[authEndpoint, redirectUri, clientId, profile, origin].forEach((v) =>
    assertString(v, 'createAuthClient: missing required config'),
  )

  const backend = createBackend(origin)

  const updateChannel = makeChannel('auth-status')

  updateChannel.on((msg) => {
    if (msg === 'update') updateStatus(false)
  })

  /* ---- reactive status ---- */
  let status = { isAuthenticated: false, userID: '', refreshBy: 0 }
  const listeners = new Set()

  const updateStatus = (allowChannelUpdate = true) => {
    let { userID, refreshBy } = userInfo.read()
    const isAuthenticated = refreshBy > Date.now()

    // if the cooke becomes stale we clear the userInfo.
    if (!isAuthenticated && status.isAuthenticated) {
      userID = ''
      refreshBy = 0
      userInfo.clear()
    }

    const next = {
      userID,
      refreshBy,
      isAuthenticated,
    }

    if (JSON.stringify(next) !== JSON.stringify(status)) {
      status = next
      listeners.forEach((fn) => fn({ ...next }))
      if (allowChannelUpdate) updateChannel.post('update')
    }

    return { ...next }
  }

  /* ---- last-check throttle (per-tab lock) ---- */
  const canCheck = async (cooldownMs = 5_000) =>
    withLock({ name: 'checkAllowed', ifAvailable: true }, async (lock) => {
      if (!lock) return false
      const last = +localStorage.getItem('last-check')
      const ok = !last || last + cooldownMs <= Date.now()
      if (ok) localStorage.setItem('last-check', Date.now().toString())
      return ok
    })

  /* ---- keep-alive loop ---- */
  const CHECK_COOLDOWN = 5_000
  const TICK_EVERY = 30_000
  let timerId = null

  const tick = async () => {
    const { refreshBy } = updateStatus()
    const remaining = Math.max(0, refreshBy - Date.now())
    if (await canCheck(Math.min(remaining, CHECK_COOLDOWN))) {
      await backend.check()
    }
  }

  /* ---- public API ---- */
  return {
    /** subscribe / unsubscribe */
    onAuthenticatedChange: (fn, opts = {}) => {
      listeners.add(fn)
      const cleanup = () => {
        listeners.delete(fn)
      }
      // Optional: auto-cleanup with AbortSignal
      const { signal } = opts
      if (signal instanceof AbortSignal) {
        if (signal.aborted) {
          cleanup()
        } else {
          signal.addEventListener('abort', cleanup, { once: true })
        }
      }
      return cleanup
    },

    /** grab current snapshot */
    status: updateStatus,

    logout: async () => {
      userInfo.clear()
      await backend.logout()
      updateStatus()
    },

    /** build the B2C login URL + store verifier in sessionStorage */
    loginUrl: async () => {
      const { code_verifier, code_challenge } = await pkceChallenge(96)
      const url = buildAuthorizationUrl({
        authEndpoint,
        redirectUri,
        clientId,
        profile,
        code_challenge,
        claims,
      })
      sessionStorage.setItem('ka:cv', code_verifier)
      return url
    },

    /** claim tokens, update cookie-derived status */
    exchange: async ({ code }) => {
      const code_verifier = sessionStorage.getItem('ka:cv')
      sessionStorage.removeItem('ka:cv')
      if (!code_verifier) {
        console.warn('code_verifier already used.')
        return { ok: false }
      }
      const res = await backend.exchangeCodeForCookies({ code, code_verifier })
      const ok = res?.status === 204 || res?.status === 200
      if (ok) updateStatus()
      return ok
    },

    start() {
      if (timerId != null) return
      tick().catch(console.error)
      timerId = setInterval(() => tick().catch(console.error), TICK_EVERY)
    },

    stop() {
      clearInterval(timerId)
      timerId = null
    },
  }
}

/* ───── ready-made singleton ───── */
const _auth = createAuthClient({
  clientId: '97f6a189-d3a1-404d-a871-deee589c63dc',
  profile: 'B2C_1A_AEM',
  authEndpoint:
    'https://identity.dev.az.msd.govt.nz/identity.dev.az.msd.govt.nz/B2C_1A_AEM/oauth2/v2.0/authorize',
  redirectUri: 'https://www.cutandpatch.com/auth-callback',
  claims: ['uid'],
})

export const authLogout = () => _auth.logout()
export const authLoginUrl = () => _auth.loginUrl()
export const authExchange = (c) => _auth.exchange(c)
export const authStatus = () => _auth.status()
export const onAuthChange = (fn, opts) => _auth.onAuthenticatedChange(fn, opts)
export const authStartKeepAlive = () => _auth.start()
export const authStopKeepAlive = () => _auth.stop()
