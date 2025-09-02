interface Field {
  [key: string]: any
  properties: {
    [key: string]: any
  }
}

/* eslint-disable-next-line no-unused-vars */
export default function decorate(fieldDiv: Element, fieldJson: Field) {
  fieldDiv.classList.add('toasts-container')
}
