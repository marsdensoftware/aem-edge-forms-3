export default function decorate(fieldDiv, fieldJson) {
    console.log('hi from extended checkbox group');
    const { iconName } = fieldJson.properties;
    if (iconName) {
        fieldDiv.classList.add(`extended-checkbox--icon-${iconName}`);
    }
    setTimeout(() => {
        var _a;
        // --- Setup: Find all related elements from the sibling modal ---
        const modalContainer = (_a = fieldDiv.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector('fieldset[name="modal-content"]');
        const sourceTextarea = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('textarea[name="modal-text"]');
        const saveButton = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('button[name="modal-save-button"]');
        // if (saveButton) {
        console.log('saveButton', saveButton);
        // }
        const dialog = modalContainer === null || modalContainer === void 0 ? void 0 : modalContainer.querySelector('dialog');
        // --- Initial Render: Display pre-existing text on page load ---
        const initialText = (sourceTextarea === null || sourceTextarea === void 0 ? void 0 : sourceTextarea.value) || '';
        if (initialText) {
            const divider = document.createElement('hr');
            divider.classList.add('checkbox-divider');
            const descriptionTextarea = document.createElement('textarea');
            descriptionTextarea.classList.add('checkbox-description');
            descriptionTextarea.placeholder = 'Enter description here';
            descriptionTextarea.value = initialText;
            const editDiv = document.createElement('div');
            const editLink = document.createElement('a');
            editLink.classList.add('edit');
            editLink.href = '#';
            editLink.textContent = 'Edit description';
            editDiv.appendChild(editLink);
            // Make the "Edit" link functional by having it open the modal
            editLink.addEventListener('click', (e) => {
                e.preventDefault();
                dialog === null || dialog === void 0 ? void 0 : dialog.showModal();
            });
            fieldDiv.append(divider, descriptionTextarea, editDiv);
        }
        // --- Event Listener: Connect the modal's "Save" button to this component ---
        if (saveButton && sourceTextarea && dialog) {
            saveButton.addEventListener('click', (event) => {
                var _a;
                // --- ADDED FOR DEBUGGING ---
                console.log('Modal "Save" button clicked!');
                // Prevent the button from submitting the form
                event.preventDefault();
                const newText = sourceTextarea.value;
                // Find the description elements within this checkbox component
                let divider = fieldDiv.querySelector('.checkbox-divider');
                let descriptionTextarea = fieldDiv.querySelector('.checkbox-description');
                let editContainer = (_a = fieldDiv.querySelector('.edit')) === null || _a === void 0 ? void 0 : _a.parentElement;
                if (newText) {
                    // If description elements don't exist yet, create them now
                    if (!descriptionTextarea) {
                        divider = document.createElement('hr');
                        divider.className = 'checkbox-divider';
                        descriptionTextarea = document.createElement('textarea');
                        descriptionTextarea.className = 'checkbox-description';
                        descriptionTextarea.placeholder = 'Enter description here';
                        editContainer = document.createElement('div');
                        const editLink = document.createElement('a');
                        editLink.className = 'edit';
                        editLink.href = '#';
                        editLink.textContent = 'Edit description';
                        editContainer.appendChild(editLink);
                        // Also make this newly created "Edit" link open the modal
                        editLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            dialog.showModal();
                        });
                        fieldDiv.append(divider, descriptionTextarea, editContainer);
                    }
                    // Update the textarea's value with the new text from the modal
                    descriptionTextarea.value = newText;
                }
                else {
                    // If the new text is empty, remove the description elements
                    divider === null || divider === void 0 ? void 0 : divider.remove();
                    descriptionTextarea === null || descriptionTextarea === void 0 ? void 0 : descriptionTextarea.remove();
                    editContainer === null || editContainer === void 0 ? void 0 : editContainer.remove();
                }
                // Close the modal after the "save" action is complete
                dialog.close();
            });
        }
        else {
            console.log('Could not find all modal elements');
        }
    }, 500);
    return fieldDiv;
}
