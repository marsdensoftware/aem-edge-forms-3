// import { authStartKeepAlive } from './msd/auth.js'

const isEditor = () =>
  document.querySelector('main[data-aue-resource],main[data-aue-label]') !==
  null

console.log('hello delayed script', { isEditor: isEditor() })
