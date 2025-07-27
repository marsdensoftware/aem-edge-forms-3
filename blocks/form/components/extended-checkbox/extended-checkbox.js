export default function decorate(fieldDiv, fieldJson) {
    var _a;
    console.log('hi from extended checkbox group');
    const { iconName } = fieldJson.properties;
    // if we have an iconName, then add the extended-checkbox--icon-${iconName} class to the fieldDiv
    if (iconName) {
        fieldDiv.classList.add(`extended-checkbox--icon-${iconName}`);
    }
    // 1. Traverse up to the parent and then to its next sibling, which contains the modal content.
    const modalContentContainer = (_a = fieldDiv.parentElement) === null || _a === void 0 ? void 0 : _a.nextElementSibling;
    // 2. Find the source textarea within that container using a specific attribute selector.
    const sourceTextarea = modalContentContainer === null || modalContentContainer === void 0 ? void 0 : modalContentContainer.querySelector('textarea[name="modal-text"]');
    // 3. Get the value from the source textarea. Fallback to an empty string if not found.
    // const textAreaText = sourceTextarea?.value
    //      || 'Copy here explaining an example of this skill etc over multiple lines as required. Copy here explaining an example of this skill etc over multiple lines as required.';
    // Find the checkbox input
    const checkbox = fieldDiv.querySelector('input[type="checkbox"]');
    // Create the destination textarea and set its value
    const destTextArea = document.createElement('textarea');
    destTextArea.classList.add('checkbox-description');
    // destTextArea.placeholder = 'Enter description here'
    // Create the divider
    const divider = document.createElement('hr');
    divider.classList.add('checkbox-divider');
    destTextArea.value = (sourceTextarea === null || sourceTextarea === void 0 ? void 0 : sourceTextarea.value) || '';
    // Create the edit link container
    const editDiv = document.createElement('div');
    const editLink = document.createElement('a');
    editLink.classList.add('edit');
    editLink.href = '#';
    editLink.textContent = 'Add description';
    // Add click handler to edit link that triggers the checkbox
    editLink.addEventListener('click', (e) => {
        e.preventDefault();
        checkbox === null || checkbox === void 0 ? void 0 : checkbox.click();
    });
    editDiv.appendChild(editLink);
    // Append all new elements to the main field div
    fieldDiv.append(divider, destTextArea, editDiv);
    //if there is no sourceTextarea.value, don't show the fieldDiv element
    if (!(sourceTextarea === null || sourceTextarea === void 0 ? void 0 : sourceTextarea.value)) {
        divider.style.display = 'none';
        destTextArea.style.display = 'none';
        editDiv.style.display = 'none';
    }
    //get hold of the modal's 'save' button in a timeout of 500ms to give a chance for the modal to be created:
    setTimeout(() => {
        var _a;
        const modalContainer = (_a = fieldDiv.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector('fieldset[name="modal-content"]');
        console.log('modalContainer', modalContainer);
        const sourceTextarea = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('textarea[name="modal-text"]');
        //print out the value of the sourceTextArea as soon as we get it - gets the default value
        if (sourceTextarea) {
            console.log('Source textarea value:', sourceTextarea.value);
        }
        else {
            console.log('Source textarea not found');
        }
        //get the destTextArea value
        if (destTextArea) {
            console.log("Text Area: ", destTextArea);
        }
        else {
            console.log('Dest text area not found');
        }
        if (sourceTextarea && destTextArea) {
            destTextArea.value = sourceTextarea.value;
        }
        //console log the saveButton as soon as we get it
        const saveButton = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('button[name="modal-save-button"]');
        if (saveButton) {
            console.log('Save button:', saveButton);
            saveButton.textContent = 'Save';
            //add an onclick listener to the save button which will simply console log the value from the sourceTextArea
            saveButton.addEventListener('click', () => {
                if (sourceTextarea) {
                    console.log('Source textarea value:', sourceTextarea.value);
                }
                //get the destTextArea value
                if (destTextArea) {
                    console.log("Text Area in eventListener: ", destTextArea);
                }
                else {
                    console.log('Dest text area not found in eventListener');
                }
                if (sourceTextarea && destTextArea) {
                    if (sourceTextarea === null || sourceTextarea === void 0 ? void 0 : sourceTextarea.value) {
                        destTextArea.value = sourceTextarea.value;
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
                //get the closest dialog element
                const dialog = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('dialog');
                if (dialog) {
                    dialog.close();
                }
            });
        }
        else {
            console.log('Save button not found');
        }
        //change the label on the save button to be "Update"
        if (saveButton) {
        }
    }, 500);
    return fieldDiv;
}
