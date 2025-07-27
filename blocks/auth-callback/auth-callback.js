export default function decorate(block) {
  console.log('hello auth-callback block', { isEditor: isEditor(block) })
}
