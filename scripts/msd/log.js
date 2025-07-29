const debug = (...args) => {
  console.log(...args) // eslint-disable-line no-console
}

const warn = (...args) => {
  console.warn(...args) // eslint-disable-line no-console
}

const error = (...args) => {
  console.error(...args) // eslint-disable-line no-console
}

export { debug, warn, error }
