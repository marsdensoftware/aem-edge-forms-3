// add delayed functionality here
//
//
console.log('Delayed started')
for (const m of document.querySelectorAll('main')) {
  for (const a of m.attributes) {
    console.log(a)
    console.log(a.name)
    console.log(a.value)
  }
}
console.log('Delayed ended')
//import { authStartKeepAlive } from './auth.js'
//authStartKeepAlive()
