interface Field {
  [key: string]: any
  properties: {
    datasource: string
    [key: string]: any
  }
}

/**
 * Enhances the modal save button functionality by adding event listeners and updating UI elements based on user interactions.
 *
 * @param {Element} fieldDiv - The DOM element representing the container for the modal field.
 * @param {HTMLParagraphElement} destTextArea - The paragraph element where the source text area's value will be displayed.
 * @param {HTMLAnchorElement} editLink - The anchor element used to toggle the edit state of the description.
 * @param {HTMLHRElement} divider - The horizontal rule element to be displayed or hidden based on the modal interactions.
 * @param {HTMLDivElement} editDiv - The div element containing editing controls to be shown or hidden based on modal interactions.
 * @return {void} Does not return anything. Modifies DOM elements and handles user interaction dynamically.
 */
function decorateModalSaveButton(fieldDiv: Element, destTextArea: HTMLParagraphElement, editLink: HTMLAnchorElement, divider: HTMLHRElement, editDiv: HTMLDivElement) {
  setTimeout(() => {
    const modalContainer = fieldDiv.parentElement?.querySelector('.modal-content')

    const sourceTextarea = modalContainer?.querySelector<HTMLTextAreaElement>(
        '.field-modal-content-panel textarea',
    )

    if (sourceTextarea && destTextArea) {
      destTextArea.textContent = sourceTextarea.value
    }

    // console log the saveButton as soon as we get it
    const saveButton = modalContainer?.querySelector(
        'button[name="modal-save-button"]',
    )
    if (saveButton) {
      // console.log('Save button:', saveButton)
      saveButton.textContent = 'Save'

      // add an onclick listener to the save button which will simply console log the value from the sourceTextArea
      saveButton.addEventListener('click', () => {

        if (sourceTextarea && destTextArea) {
          if (sourceTextarea?.value) {
            destTextArea.textContent = sourceTextarea.value
            destTextArea.style.display = 'block'
            editLink.textContent = 'Edit description'
          } else {
            destTextArea.style.display = 'none'
            editLink.textContent = 'Add description'
          }

          // the divider element has its display set to none - remove that style
          divider.style.display = 'block'
          editDiv.style.display = 'block'
        }

        // get the closest dialog element
        const dialog = saveButton?.closest('dialog')
        if (dialog) {
          // console.log('got the dialog', dialog)
          dialog.close()
        } else {
          console.log('no dialog found')
        }
      })
    } else {
      console.log('Save button not found')
    }

  }, 500)
}

/**
 * Decorates the cancel button of a modal dialog with custom logic.
 * This includes updating the cancel button text, synchronizing textarea content,
 * and ensuring the modal closes upon cancellation.
 *
 * @param {Element} fieldDiv - The parent element containing the modal.
 * @param {HTMLParagraphElement} destTextArea - The paragraph element containing the destination text.
 * @return {void} This function does not return a value.
 */
function decorateModalCancelButton(fieldDiv: Element, destTextArea: HTMLParagraphElement) {
  setTimeout(() => {
    const modalContainer = fieldDiv.parentElement?.querySelector('.modal-content')

    const sourceTextarea = modalContainer?.querySelector<HTMLTextAreaElement>(
        '.field-modal-content-panel textarea',
    )

    // console log the saveButton as soon as we get it
    const cancelButton = modalContainer?.querySelector(
        'button[name="modal-cancel-button"]',
    )
    if (cancelButton) {
      // console.log('Save button:', saveButton)
      cancelButton.textContent = 'Cancel'

      // add an onclick listener to the cancel button which will simply close the modal
      cancelButton.addEventListener('click', () => {

        if (sourceTextarea && destTextArea) {
          //copy the text from the destTextArea (which is a <p> element) into the sourceTextArea.value
          sourceTextarea.value = destTextArea.textContent || '';
        }

        // get the closest dialog element
        const dialog = cancelButton?.closest('dialog')
        if (dialog) {
          dialog.close()
        } else {
          console.log('no dialog found')
        }
      })
    } else {
      console.log('Cancel button not found')
    }

  }, 500)
}


/**
 * Configures the behavior of a checkbox such that when it is checked,
 * specified elements are displayed, and when it is unchecked,
 * those elements are hidden.
 *
 * @param {HTMLInputElement | null} checkbox - The checkbox element being observed for state changes.
 * @param {HTMLParagraphElement} destTextArea - The text area element whose display state is toggled.
 * @param {HTMLHRElement} divider - The horizontal divider element whose display state is toggled.
 * @param {HTMLDivElement} editDiv - The div element whose display state is toggled.
 * @return {void} This function does not return anything.
 */
function decorateCheckboxOnState(checkbox: HTMLInputElement | null, destTextArea: HTMLParagraphElement, divider: HTMLHRElement, editDiv: HTMLDivElement) {
  if (checkbox) {
    checkbox.addEventListener('click', () => {
      if (checkbox.checked && checkbox.value === 'on') {
        destTextArea.style.display = 'block';
        divider.style.display = 'block';
        editDiv.style.display = 'block';
      } else {
        destTextArea.style.display = 'none';
        divider.style.display = 'none';
        editDiv.style.display = 'none';
      }
    });
  }
}

export default function decorate(fieldDiv: Element, fieldJson: Field) {

  //add the extended-checkbox-wrapper class to the fieldDiv
  fieldDiv.classList.add('extended-checkbox')

  const { iconName } = fieldJson.properties

  // Find the checkbox input
  const checkbox = fieldDiv.querySelector<HTMLInputElement>(
    'input[type="checkbox"]',
  )

  const label = fieldDiv.querySelector('label')
  // if we have an iconName, add an icon element with the appropriate classes
  if (iconName) {
    const iconElement = document.createElement('span')
    iconElement.classList.add(
      'extended-checkbox__icon',
      `extended-checkbox__icon--${iconName}`,
    )

    // Insert the icon after inside label
    label?.prepend(iconElement)
  }

  // Create the destination paragraph element
  const destTextArea = document.createElement('p')
  destTextArea.classList.add('extended-checkbox--description')
  destTextArea.style.display = 'none'

  // Create the divider
  const divider = document.createElement('hr')
  divider.classList.add('checkbox-divider')
  divider.style.display = 'none'

  // Create the edit link container
  const editDiv = document.createElement('div')
  const editLink = document.createElement('a')
  editLink.classList.add('edit')
  editLink.href = '#'
  editLink.textContent = 'Add description'

  // Add click handler to edit link that triggers the rules engine
  editLink.addEventListener('click', (e) => {
    e.preventDefault()
    if (checkbox) {
      //if the value is 'on' then trigger the click()
      if (checkbox.checked && checkbox.value === 'on') {
        checkbox?.click()
      }

      checkbox?.click()
    }
  })

  editDiv.appendChild(editLink)
  editDiv.style.display = 'none'

  // Append all new elements to the main field div
  fieldDiv.append(divider, destTextArea, editDiv)

  decorateModalSaveButton(fieldDiv, destTextArea, editLink, divider, editDiv);
  decorateModalCancelButton(fieldDiv, destTextArea);
  decorateCheckboxOnState(checkbox, destTextArea, divider, editDiv);

  return fieldDiv
}
