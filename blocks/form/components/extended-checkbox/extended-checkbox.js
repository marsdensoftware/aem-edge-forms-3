/*eslint-disable*/
import { onElementsAddedByClassName } from '../utils.js';
/**
 * Enhances the modal save button functionality by adding event listeners and updating UI elements
 * based on user interactions.
 *
 * @param {Element} fieldDiv - The DOM element representing the container for the modal field.
 * @param {HTMLParagraphElement} destTextArea - The paragraph element where the source text
 area's value will be displayed.
 * @param {HTMLAnchorElement} editLink - The anchor element used to toggle the edit state of
 the description.
 * @param {HTMLHRElement} divider - The horizontal rule element to be displayed or hidden based
 on the modal interactions.
 * @param {HTMLDivElement} editDiv - The div element containing editing controls to be shown or
 hidden based on modal interactions.
 * @return {void} Does not return anything. Modifies DOM elements and handles user interaction
 dynamically.
 */
function decorateModalSaveButton(fieldDiv, destTextArea, editLink, divider, editDiv) {
    onElementsAddedByClassName('modal-content', ((modalContainer) => {
        var _a;
        // check is the connectedEl is a child of the fieldDiv's parent
        if ((_a = fieldDiv.parentElement) === null || _a === void 0 ? void 0 : _a.contains(modalContainer)) {
            const sourceTextarea = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('.field-modal-content-panel textarea');
            if (sourceTextarea && destTextArea) {
                destTextArea.textContent = sourceTextarea.value;
            }
            // console log the saveButton as soon as we get it
            const saveButton = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('button[name="modal-save-button"]');
            if (saveButton) {
                // console.log('Save button:', saveButton)
                saveButton.textContent = 'Save';
                // add an onclick listener to the save button which will simply console
                // log the value from the sourceTextArea
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
        }
    }));
}
/**
 * Decorates the cancel button of a modal dialog with custom logic.
 * This includes updating the cancel button text, synchronizing textarea content,
 * and ensuring the modal closes upon cancellation.
 *
 * @param {Element} fieldDiv - The parent element containing the modal.
 * @param {HTMLParagraphElement} destTextArea - The paragraph element containing
 the destination text.
 * @return {void} This function does not return a value.
 */
function decorateModalCancelButton(fieldDiv, destTextArea) {
    onElementsAddedByClassName('modal-content', ((modalContainer) => {
        var _a;
        if ((_a = fieldDiv.parentElement) === null || _a === void 0 ? void 0 : _a.contains(modalContainer)) {
            const sourceTextarea = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('.field-modal-content-panel textarea');
            // console log the saveButton as soon as we get it
            const cancelButton = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('button[name="modal-cancel-button"]');
            if (cancelButton) {
                // console.log('Save button:', saveButton)
                cancelButton.textContent = 'Cancel';
                // add an onclick listener to the cancel button which will simply close the modal
                cancelButton.addEventListener('click', () => {
                    if (sourceTextarea && destTextArea) {
                        // copy the text from the destTextArea (which is a <p> element) into the
                        // sourceTextArea.value
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
        }
    }));
}
function decorateDialogCloseButton(fieldDiv, destTextArea) {
    onElementsAddedByClassName('modal', ((modalDialogDiv) => {
        var _a;
        if ((_a = fieldDiv.parentElement) === null || _a === void 0 ? void 0 : _a.contains(modalDialogDiv)) {
            const modalDialog = modalDialogDiv === null || modalDialogDiv === void 0 ? void 0 : modalDialogDiv.querySelector('dialog');
            const sourceTextarea = modalDialog === null || modalDialog === void 0 ? void 0 : modalDialog.querySelector('.field-modal-content-panel textarea');
            // console log the saveButton as soon as we get it
            const closeButton = modalDialog === null || modalDialog === void 0 ? void 0 : modalDialog.querySelector('.close-button');
            if (closeButton) {
                // add an onclick listener to the cancel button which will simply close the modal
                closeButton.addEventListener('click', () => {
                    if (sourceTextarea && destTextArea) {
                        // copy the text from the destTextArea (which is a <p> element) into the
                        // sourceTextArea.value
                        sourceTextarea.value = destTextArea.textContent || '';
                    }
                });
            }
            else {
                console.log('Dialog close button not found');
            }
        }
    }));
}
/**
 * Configures the behavior of a checkbox such that when it is checked,
 * specified elements are displayed, and when it is unchecked,
 * those elements are hidden.
 *
 * @param {HTMLInputElement | null} checkbox - The checkbox element being observed for
 * state changes.
 * @param {HTMLParagraphElement} destTextArea - The text area element whose display state
 * is toggled.
 * @param {HTMLHRElement} divider - The horizontal divider element whose display state is toggled.
 * @param {HTMLDivElement} editDiv - The div element whose display state is toggled.
 * @return {void} This function does not return anything.
 */
function decorateCheckboxOnState(checkbox, destTextArea, divider, editDiv) {
    if (checkbox) {
        checkbox.addEventListener('click', () => {
            if (checkbox.checked && checkbox.value === 'on') {
                destTextArea.style.display = 'block';
                divider.style.display = 'block';
                editDiv.style.display = 'block';
            }
            else {
                destTextArea.style.display = 'none';
                divider.style.display = 'none';
                editDiv.style.display = 'none';
            }
        });
    }
}
export default function decorate(fieldDiv, fieldJson) {
    fieldDiv.classList.add('extended-checkbox'); // add the extended-checkbox-wrapper class to the fieldDiv
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
            // if the value is 'on' then trigger the click()
            if (checkbox.checked && checkbox.value === 'on') {
                checkbox === null || checkbox === void 0 ? void 0 : checkbox.click();
            }
            checkbox === null || checkbox === void 0 ? void 0 : checkbox.click();
        }
    });
    editDiv.appendChild(editLink);
    editDiv.style.display = 'none';
    // add a div for the extended-0checkbox--footer which will contain the description adn edit link
    const extendedCheckboxFooter = document.createElement('div');
    extendedCheckboxFooter.classList.add('extended-checkbox--footer');
    extendedCheckboxFooter.appendChild(destTextArea);
    extendedCheckboxFooter.appendChild(editDiv);
    // Append all new elements to the main field div
    fieldDiv.append(divider, extendedCheckboxFooter);
    decorateModalSaveButton(fieldDiv, destTextArea, editLink, divider, editDiv);
    decorateModalCancelButton(fieldDiv, destTextArea);
    decorateCheckboxOnState(checkbox, destTextArea, divider, editDiv);
    decorateDialogCloseButton(fieldDiv, destTextArea);
    return fieldDiv;
}
