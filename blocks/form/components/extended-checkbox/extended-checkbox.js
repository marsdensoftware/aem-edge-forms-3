function decorateModalSaveButton(fieldDiv, destTextArea, editLink, divider, editDiv) {
    setTimeout(() => {
        var _a;
        const modalContainer = (_a = fieldDiv.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector('.modal-content');
        const sourceTextarea = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('.field-modal-content-panel textarea');
        if (sourceTextarea && destTextArea) {
            destTextArea.textContent = sourceTextarea.value;
        }
        // console log the saveButton as soon as we get it
        const saveButton = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('button[name="modal-save-button"]');
        if (saveButton) {
            // console.log('Save button:', saveButton)
            saveButton.textContent = 'Save';
            // add an onclick listener to the save button which will simply console log the value from the sourceTextArea
            saveButton.addEventListener('click', () => {
                if (sourceTextarea && destTextArea) {
                    if (sourceTextarea === null || sourceTextarea === void 0 ? void 0 : sourceTextarea.value) {
                        destTextArea.textContent = sourceTextarea.value;
                        destTextArea.style.display = 'block';
                        editLink.textContent = 'Edit description';
                    }
                    else {
                        destTextArea.style.display = 'none';
                        editLink.textContent = 'Add description';
                    }
                    // the divider element has its display set to none - remove that style
                    divider.style.display = 'block';
                    editDiv.style.display = 'block';
                }
                // get the closest dialog element
                const dialog = saveButton === null || saveButton === void 0 ? void 0 : saveButton.closest('dialog');
                if (dialog) {
                    // console.log('got the dialog', dialog)
                    dialog.close();
                }
                else {
                    console.log('no dialog found');
                }
            });
        }
        else {
            console.log('Save button not found');
        }
    }, 500);
}
function decorateModalCancelButton(fieldDiv, destTextArea, editLink, divider, editDiv) {
    setTimeout(() => {
        var _a;
        const modalContainer = (_a = fieldDiv.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector('.modal-content');
        const sourceTextarea = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('.field-modal-content-panel textarea');
        // console log the saveButton as soon as we get it
        const cancelButton = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('button[name="modal-cancel-button"]');
        if (cancelButton) {
            // console.log('Save button:', saveButton)
            cancelButton.textContent = 'Cancel';
            // add an onclick listener to the cancel button which will simply close the modal
            cancelButton.addEventListener('click', () => {
                if (sourceTextarea && destTextArea) {
                    //copy the text from the destTextArea (which is a <p> element) into the sourceTextArea.value
                    sourceTextarea.value = destTextArea.textContent || '';
                }
                // get the closest dialog element
                const dialog = cancelButton === null || cancelButton === void 0 ? void 0 : cancelButton.closest('dialog');
                if (dialog) {
                    dialog.close();
                }
                else {
                    console.log('no dialog found');
                }
            });
        }
        else {
            console.log('Cancel button not found');
        }
    }, 500);
}
export default function decorate(fieldDiv, fieldJson) {
    //add the extended-checkbox-wrapper class to the fieldDiv
    fieldDiv.classList.add('extended-checkbox');
    const { iconName } = fieldJson.properties;
    // Find the checkbox input
    const checkbox = fieldDiv.querySelector('input[type="checkbox"]');
    const label = fieldDiv.querySelector('label');
    // if we have an iconName, add an icon element with the appropriate classes
    if (iconName) {
        const iconElement = document.createElement('span');
        iconElement.classList.add('extended-checkbox__icon', `extended-checkbox__icon--${iconName}`);
        // Insert the icon after inside label
        label === null || label === void 0 ? void 0 : label.prepend(iconElement);
    }
    // Create the destination paragraph element
    const destTextArea = document.createElement('p');
    destTextArea.classList.add('extended-checkbox--description');
    destTextArea.style.display = 'none';
    // Create the divider
    const divider = document.createElement('hr');
    divider.classList.add('checkbox-divider');
    divider.style.display = 'none';
    // Create the edit link container
    const editDiv = document.createElement('div');
    const editLink = document.createElement('a');
    editLink.classList.add('edit');
    editLink.href = '#';
    editLink.textContent = 'Add description';
    // Add click handler to edit link that triggers the rules engine
    editLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (checkbox) {
            //if the value is 'on' then trigger the click()
            if (checkbox.checked && checkbox.value === 'on') {
                checkbox === null || checkbox === void 0 ? void 0 : checkbox.click();
            }
            checkbox === null || checkbox === void 0 ? void 0 : checkbox.click();
        }
    });
    editDiv.appendChild(editLink);
    editDiv.style.display = 'none';
    // Append all new elements to the main field div
    fieldDiv.append(divider, destTextArea, editDiv);
    // get hold of the modal's 'save' button
    // in a timeout of 500ms to give a chance for the modal to be created:
    decorateModalSaveButton(fieldDiv, destTextArea, editLink, divider, editDiv);
    decorateModalCancelButton(fieldDiv, destTextArea, editLink, divider, editDiv);
    return fieldDiv;
}
