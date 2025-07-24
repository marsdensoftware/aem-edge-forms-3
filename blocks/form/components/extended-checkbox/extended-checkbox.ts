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

  if (iconName) {
    fieldDiv.classList.add(`extended-checkbox--icon-${iconName}`)
  }

  setTimeout(() => {
    // --- Setup: Find all related elements from the sibling modal ---
    const modalContainer = fieldDiv.parentElement?.querySelector('fieldset[name="modal-content"]')
    const sourceTextarea = modalContainer?.querySelector<HTMLTextAreaElement>('textarea[name="modal-text"]')
    const saveButton = modalContainer?.querySelector('button[name="modal-save-button"]')
    // if (saveButton) {
    console.log('saveButton', saveButton)
    // }
    const dialog = modalContainer?.querySelector('dialog')

    // --- Initial Render: Display pre-existing text on page load ---
    const initialText = sourceTextarea?.value || ''
    if (initialText) {
      const divider = document.createElement('hr')
      divider.classList.add('checkbox-divider')

      const descriptionTextarea = document.createElement('textarea')
      descriptionTextarea.classList.add('checkbox-description')
      descriptionTextarea.placeholder = 'Enter description here'
      descriptionTextarea.value = initialText

      const editDiv = document.createElement('div')
      const editLink = document.createElement('a')
      editLink.classList.add('edit')
      editLink.href = '#'
      editLink.textContent = 'Edit description'
      editDiv.appendChild(editLink)

      // Make the "Edit" link functional by having it open the modal
      editLink.addEventListener('click', (e) => {
        e.preventDefault()
        dialog?.showModal()
      })

      fieldDiv.append(divider, descriptionTextarea, editDiv)
    }

    // --- Event Listener: Connect the modal's "Save" button to this component ---
    if (saveButton && sourceTextarea && dialog) {
      saveButton.addEventListener('click', (event) => {
        // --- ADDED FOR DEBUGGING ---
        console.log('Modal "Save" button clicked!')

        // Prevent the button from submitting the form
        event.preventDefault()

        const newText = sourceTextarea.value

        // Find the description elements within this checkbox component
        let divider = fieldDiv.querySelector('.checkbox-divider')
        let descriptionTextarea = fieldDiv.querySelector<HTMLTextAreaElement>('.checkbox-description')
        let editContainer = fieldDiv.querySelector('.edit')?.parentElement

        if (newText) {
          // If description elements don't exist yet, create them now
          if (!descriptionTextarea) {
            divider = document.createElement('hr')
            divider.className = 'checkbox-divider'

            descriptionTextarea = document.createElement('textarea')
            descriptionTextarea.className = 'checkbox-description'
            descriptionTextarea.placeholder = 'Enter description here'

            editContainer = document.createElement('div')
            const editLink = document.createElement('a')
            editLink.className = 'edit'
            editLink.href = '#'
            editLink.textContent = 'Edit description'
            editContainer.appendChild(editLink)

            // Also make this newly created "Edit" link open the modal
            editLink.addEventListener('click', (e) => {
              e.preventDefault()
              dialog.showModal()
            })

            fieldDiv.append(divider, descriptionTextarea, editContainer)
          }
          // Update the textarea's value with the new text from the modal
          descriptionTextarea.value = newText
        } else {
          // If the new text is empty, remove the description elements
          divider?.remove()
          descriptionTextarea?.remove()
          editContainer?.remove()
        }

        // Close the modal after the "save" action is complete
        dialog.close()
      })
    } else {
      console.log('Could not find all modal elements')
    }
  }, 500)

  return fieldDiv
}
