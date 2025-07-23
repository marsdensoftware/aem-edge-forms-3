interface Field {
  [key: string]: any
  properties: {
    datasource: string
    [key: string]: any
  }
}

export default function decorate(fieldDiv: Element, fieldJson: Field) {
  console.log('hi from extended checkbox group')

  const { iconName } = fieldJson.properties

  // if we have an iconName, then add the extended-checkbox--icon-${iconName} class to the fieldDiv
  if (iconName) {
    fieldDiv.classList.add(`extended-checkbox--icon-${iconName}`)
  }

  // 1. Traverse up to the parent and then to its next sibling, which contains the modal content.
  const modalContentContainer = fieldDiv.parentElement?.nextElementSibling

  // 2. Find the source textarea within that container using a specific attribute selector.
  const sourceTextarea = modalContentContainer?.querySelector<HTMLTextAreaElement>('textarea[name="modal-text"]')

  // 3. Get the value from the source textarea. Fallback to an empty string if not found.
  const textAreaText = sourceTextarea?.value ||
      'Copy here explaining an example of this skill etc over multiple lines as required. Copy here explaining an example of this skill etc over multiple lines as required.'

  if (textAreaText) {
    // Create the divider
    const divider = document.createElement('hr')
    divider.classList.add('checkbox-divider')

    // Create the destination textarea and set its value
    const textArea = document.createElement('textarea')
    textArea.classList.add('checkbox-description')
    textArea.placeholder = 'Enter description here'
    textArea.value = textAreaText; // Use the dynamically fetched value

    // Create the edit link container
    const editDiv = document.createElement('div')
    const editLink = document.createElement('a')
    editLink.classList.add('edit')
    editLink.href = '#'
    editLink.textContent = 'Edit description'
    editDiv.appendChild(editLink)

    // Append all new elements to the main field div
    fieldDiv.append(divider, textArea, editDiv)
  }

  return fieldDiv

}
