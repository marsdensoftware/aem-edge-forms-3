import { isEditor } from '../../scripts/msd/blocks.js'

export default function decorate(block) {
  console.log('hello auth-callback block', { isEditor: isEditor(block) })
}
