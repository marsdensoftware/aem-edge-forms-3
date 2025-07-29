/* ──────────────────────────────────────── Web Crypto  ──────────────────────────────────────── */
/*
 * this code locks the crypto module from being tampered
 * with / polyfilled. This script should be run before any extern imports are.
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

/* ──────────────────────────────────────── helpers  ──────────────────────────────────────── */

/** @param {unknown} v */
const isString = (v) => {
  if (typeof v === 'string' && v.length > 0) {
    return true
  }
  return false
}

/**
 * @param {any} v
 * @param {string} msg error message
 * @throws {Error}
 */
const assertString = (v, msg) => {
  if (!isString(v)) throw new Error(msg)
}

const error = (...args) => {
  console.error(...args) // eslint-disable-line no-console
}

const warn = (...args) => {
  console.warn(...args) // eslint-disable-line no-console
}

const debug = (...args) => {
  console.log(...args) // eslint-disable-line no-console
}

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
  for (let i = 0; i < size; i += 1) {
    // cap the value of the randomIndex to mask.length - 1
    const randomIndex = randomUints[i] % mask.length
    result += mask[randomIndex]
  }
  return result
}

/** @param {string} codeVerifier */
const generateChallenge = async (verifier) => {
  const buffer = await safeDigest('SHA-256', new TextEncoder().encode(verifier))
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
 * @returns {Promise<{verifier: string, challenge: string}>} PKCE challenge pair
 */
const pkceChallenge = async (length = 43) => {
  if (length < 43 || length > 128) {
    throw new Error(`Expected a length between 43 and 128. Received ${length}.`)
  }
  const verifier = generateVerifier(length)
  const challenge = await generateChallenge(verifier)
  return {
    verifier,
    challenge,
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
 * @param {string} params.challenge – PKCE code challenge.
 * @param {string[]} params.claims     – Optional claims.
 * @returns {string}
 */
const buildAuthorizationUrl = ({
  authEndpoint,
  redirectUri,
  clientId,
  profile,
  challenge,
  claims,
}) => {
  const params = new URLSearchParams()

  if (profile) params.set('p', profile)

  if (claims && Array.isArray(claims)) {
    claims.filter(isString).forEach((c) => {
      params.append('claims', c)
    })
  }

  params.set('client_id', clientId)
  params.set('redirect_uri', redirectUri)
  params.set('response_type', 'code')
  params.set('scope', 'openid offline_access')
  params.set('nonce', 'defaultNonce')
  params.set('code_challenge', challenge)
  params.set('code_challenge_method', 'S256')
  params.set('prompt', 'login')

  return `${authEndpoint}?${params}`
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
const withLock = async (fn, options = {}) => {
  const opts = {
    name: '',
    ifAvailable: false,
    maxAge: 15_000,
    maxWait: 30_000,
    poll: 100,
    ...options,
  }
  /* ——— native Web Locks API when it exists ——— */
  if (navigator?.locks?.request) {
    if (opts.ifAvailable) {
      return navigator.locks.request(opts.name, { ifAvailable: true }, fn)
    }
    if (!opts.maxWait) {
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
    // Match Web Locks API behavior
    if (opts.ifAvailable) return undefined

    const deadline = Date.now() + opts.maxWait
    const sleep = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms)
      })

    while (!isFree()) {
      if (Date.now() >= deadline) {
        warn('Lock timed out', key) // eslint-disable-line no-console
        return undefined // timed out
      }
      await sleep(opts.poll) // eslint-disable-line no-await-in-loop
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
const readCookie = (name) => {
  function startsWith(c) {
    return c.startsWith(`${name}=`)
  }
  return (
    document.cookie
      .split('; ')
      .find(startsWith)
      ?.slice(name.length + 1) ?? null
  )
}

/** @param {string} name */
const clearCookie = (name) => {
  document.cookie = `${name}=; Path=/; Secure; SameSite=Strict; Max-Age=0`
}

const userInfo = {
  /** @returns {{userID:string, refreshBy:number}} */
  read() {
    const raw = readCookie('user')
    if (!raw) return DEFAULT_INFO
    try {
      const obj = JSON.parse(atob(raw))
      // ensure rb is number (in seconds)
      const sec =
        typeof obj.rb === 'number' ? obj.rb : Number.parseInt(obj.rb, 10)
      const refreshBy = Number.isFinite(sec) ? sec * 1000 : 0
      return {
        userID: obj.uid ?? obj.cn ?? '',
        refreshBy,
      }
    } catch (err) {
      error('Failed to parse user cookie:', err)
      return DEFAULT_INFO
    }
  },

  clear() {
    clearCookie('user')
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
const createBackend = (origin, rootUri = '/session') => {
  assertString(origin, 'createBackend: origin is required')

  const inflight = new Set()
  const backendCtrl = new AbortController()

  /** Decode an HTTP Response
   * @param {Response} resp
   * @returns {Promise<{type:string, data:any, error?:Error}>}
   */
  const decode = async (resp) => {
    const ct = resp.headers.get('content-type') ?? ''

    if (ct === '' || NO_BODY_STATUS.has(resp.status)) {
      return { type: 'empty', data: null }
    }

    if (ct.includes(MIME.JSON)) {
      try {
        return { type: 'json', data: await resp.json() }
      } catch (err) {
        return { type: 'json', data: null, error: err }
      }
    }

    if (ct.includes(MIME.TEXT)) return { type: 'text', data: await resp.text() }

    return { type: 'unhandled', data: null }
  }

  // Compose multiple AbortSignals into one
  const composeSignal = (signals) => {
    const list = signals.filter(Boolean)
    if (list.length === 0) return undefined
    if (AbortSignal.any) return AbortSignal.any(list)
    // fallback if .any isn't available
    const ctrl = new AbortController()
    const onAbort = () => {
      ctrl.abort()
    }
    list.forEach((s) => {
      if (s.aborted) ctrl.abort()
      else s.addEventListener('abort', onAbort, { once: true })
    })
    return ctrl.signal
  }

  /** @param {string} uri @param {unknown} body @param {AbortSignal?} signal */
  const post = async (uri, body = null, signal = undefined) => {
    debug('POST', uri, body)

    const ac = new AbortController()
    inflight.add(ac)

    const composed = composeSignal([ac.signal, backendCtrl.signal, signal])

    const fetchOpts = {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      ...(body != null && { body: JSON.stringify(body) }),
      ...(composed && { signal: composed }),
    }

    let resp
    try {
      resp = await fetch(new URL(uri, origin), fetchOpts)
    } catch (err) {
      inflight.delete(ac)
      const aborted =
        (err && (err.name === 'AbortError' || err.code === 'ABORT_ERR')) ||
        composed?.aborted === true
      return {
        uri,
        status: 0,
        ok: false,
        body: null,
        bodyType: 'error',
        error: aborted ? 'aborted' : err?.message || 'fetch_failed',
        aborted,
      }
    } finally {
      inflight.delete(ac)
    }

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
    // eslint-disable-next-line implicit-arrow-linebreak
    logout: () => post(`${rootUri}/logout`),

    check: () =>
      withLock(
        async (lock) => {
          if (!lock) return undefined
          return post(`${rootUri}/check`)
        },
        { name: LOCK, ifAvailable: true },
      ),

    exchangeCodeForCookies: ({ code, verifier }, signal = undefined) =>
      withLock(
        async (lock) => {
          if (!lock) return undefined
          return post(
            `${rootUri}/exchange`,
            { code, code_verifier: verifier },
            signal,
          )
        },
        { name: LOCK, maxWait: 30_000 },
      ),

    teardown: () => {
      inflight.forEach((ac) => {
        ac.abort()
      })
      inflight.clear()
      backendCtrl.abort()
    },
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
    debug('bc-open', { id })
    const post = (msg) => {
      debug('bc-post', { id, msg })
      bc.postMessage({ sender: id, msg })
    }

    const on = (fn) =>
      bc.addEventListener('message', (e) => {
        debug('bc-event', { id, data: e.data })
        if (e.data?.sender === id) return
        fn(e.data)
      })

    return {
      post,
      on,
      close: () => {
        debug('bc-close', { id })
        bc.close()
      },
      id,
    }
  }
  // ✱ Optional fallback; here we just no-op.
  warn('BroadcastChannel not supported in this browser')
  const noop = () => {}
  return { post: noop, on: noop, close: noop }
}

/**
 * @typedef {Object} AuthClient
 * @property {() => Promise<string>}            loginUrl
 * @property {(p: {code: string}) => Promise<any>} exchange
 * @property {() => Promise<void>}              logout
 * @property {() => {isAuthenticated: boolean, userID: string, refreshBy: number}} status
 * @property {(fn: Function) => void}           onStatusChange
 * @property {(fn: Function) => void}           removeStatusChange
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
 * @property {[string]} [claims]
 * @property {string} backendUri
 * @property {string} [origin]
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
  claims,
  backendUri,
  origin,
} = {}) => {
  const params = [
    authEndpoint,
    redirectUri,
    clientId,
    profile,
    origin,
    backendUri,
  ]
  params.forEach((v) => {
    assertString(v, 'createAuthClient: missing required config')
  })

  const backend = createBackend(origin, backendUri)

  /* ---- reactive status ---- */
  let status = { isAuthenticated: false, userID: '', refreshBy: 0 }
  const listeners = new Set()

  // Create ONE channel for the lifetime of this client
  const channel = makeChannel('auth-status')

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
      isAuthenticated,
      userID,
      refreshBy,
    }

    debug('updateStatus: ', { allowChannelUpdate, status, next })

    if (JSON.stringify(next) !== JSON.stringify(status)) {
      status = next
      listeners.forEach((fn) => {
        fn({ ...next })
      })
      if (allowChannelUpdate) channel.post('update')
    }

    return { ...next }
  }

  const offChannel = channel.on((data) => {
    if (data.msg === 'update') {
      updateStatus(false)
    }
  })

  /* ---- last-check throttle (per-tab lock) ---- */
  const canCheck = async (cooldownMs = 5_000) =>
    withLock(
      async (lock) => {
        if (!lock) return false
        const last = +localStorage.getItem('last-check')
        const ok = !last || last + cooldownMs <= Date.now()
        if (ok) localStorage.setItem('last-check', Date.now().toString())
        return ok
      },
      { name: 'checkAllowed', ifAvailable: true },
    )

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

  const safeTick = () => {
    tick().catch((err) => {
      error('tick() failed', err)
    })
  }

  function startTimer() {
    if (timerId != null) return
    timerId = setInterval(safeTick, TICK_EVERY)
    safeTick() // run one immediately
  }

  function stopTimer() {
    if (timerId != null) {
      clearInterval(timerId)
      timerId = null
    }
  }

  const teardown = () => {
    stopTimer()
    backend.teardown?.()
    offChannel?.()
    channel.close()
  }

  const onPageShow = (e) => {
    if (e.persisted) {
      updateStatus()
      startTimer()
    }
  }
  window.addEventListener('pageshow', onPageShow)

  // Pause on hidden, resume on visible
  const onVisibilityChange = () => {
    if (document.hidden || document.visibilityState === 'hidden') stopTimer()
    else startTimer()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  // BFCache-aware: pause vs teardown, and resume
  window.addEventListener('pagehide', (e) => {
    // Going away; pause regardless
    // Always pause timer while we're not visible
    stopTimer()
    if (!e.persisted) {
      // Real unload or reload: full teardown
      teardown()
      // Avoid dangling listeners for this document
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pageshow', onPageShow)
    }
  })

  /* ---- public API ---- */
  return {
    /** subscribe / unsubscribe */
    onStatusChange: (fn, opts = {}) => {
      listeners.add(fn)

      const { signal } = opts
      let onAbort

      const cleanup = () => {
        listeners.delete(fn)
        if (signal && onAbort) {
          signal.removeEventListener('abort', onAbort)
          onAbort = undefined
        }
      }

      if (signal instanceof AbortSignal) {
        if (signal.aborted) {
          cleanup()
          return cleanup
        }
        onAbort = () => {
          cleanup()
        }
        signal.addEventListener('abort', onAbort, { once: true })
      }

      return cleanup
    },

    removeStatusChange: (fn) => {
      listeners.delete(fn)
    },

    /** grab current snapshot */
    status: updateStatus,

    logout: async () => {
      userInfo.clear()
      await backend.logout()
      debug('logout', { status })
      updateStatus()
    },

    /** build the B2C login URL + store verifier in sessionStorage */
    loginUrl: async () => {
      const { verifier, challenge } = await pkceChallenge(96)
      const url = buildAuthorizationUrl({
        authEndpoint,
        redirectUri: redirectUri.startsWith('/')
          ? origin + redirectUri
          : redirectUri,
        clientId,
        profile,
        challenge,
        claims,
      })
      sessionStorage.setItem('ka:cv', verifier)
      return url
    },

    /** claim tokens, update cookie-derived status */
    exchange: async ({ code }, signal = undefined) => {
      const verifier = sessionStorage.getItem('ka:cv')
      sessionStorage.removeItem('ka:cv')
      if (!verifier) {
        warn('verifier already used.')
        return { ok: false }
      }
      const res = await backend.exchangeCodeForCookies(
        { code, verifier },
        signal,
      )
      const ok = res?.status === 204 || res?.status === 200
      debug('exchangeCodeForCookies', { status: res?.status, ok })
      if (ok) updateStatus()
      return { ok }
    },

    start: startTimer,
  }
}

/* ───── ready-made singleton ───── */
const authClient = createAuthClient({
  clientId: '97f6a189-d3a1-404d-a871-deee589c63dc',
  profile: 'B2C_1A_AEM',
  authEndpoint:
    'https://identity.dev.az.msd.govt.nz/identity.dev.az.msd.govt.nz/B2C_1A_AEM/oauth2/v2.0/authorize',
  redirectUri: '/auth-callback',
  // claims: ['uid'],
  claims: ['UUID'],
  backendUri: '/bin/session',
  origin: window.location.origin,
})

export const authLogout = authClient.logout.bind(authClient)
export const authLoginUrl = authClient.loginUrl.bind(authClient)
export const authExchange = authClient.exchange.bind(authClient)
export const authStatus = authClient.status.bind(authClient)
export const onAuthChange = authClient.onStatusChange.bind(authClient)
export const removeAuthChange = authClient.removeStatusChange.bind(authClient)
export const authStartKeepAlive = authClient.start.bind(authClient)
// export const authStopKeepAlive = authClient.stop.bind(authClient)
