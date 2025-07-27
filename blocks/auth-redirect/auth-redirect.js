import { isEditor } from '../../scripts/msd/blocks.js'
import { authExchange } from '../../scripts/msd/auth.js'
import { debug, error } from '../../scripts/msd/log.js'

export default async function decorate(block) {
  debug('hello auth-callback block', { isEditor: isEditor(block) })
  const queryParams = new URLSearchParams(window.location.search)

  if (queryParams.has('error')) {
    error('Auth error:', queryParams.get('error'))
  }

  if (queryParams.has('code')) {
    const code = queryParams.get('code')
    await authExchange({ code })
    window.location.href = '/auth-login'
  }
}
