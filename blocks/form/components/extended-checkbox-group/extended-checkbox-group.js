/*eslint-disable*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { updateOrCreateInvalidMsg } from '../../util.js';
/**
 * Decorates a custom form field component
 * @param {HTMLElement} fieldDiv - The DOM element containing the field wrapper. Refer to the documentation
 * for its structure for each component.
 * @param {Object} fieldJson - The form json object for the component.
 * @param {HTMLElement} parentElement - The parent element of the field.
 * @param {string} formId - The unique identifier of the form.
 */
/* eslint-disable-next-line no-unused-vars */
export default function decorate(fieldDiv, fieldJson, parentElement, formId) {
    return __awaiter(this, void 0, void 0, function* () {
        fieldDiv.classList.add('extended-checkbox-group');
        const description = fieldDiv.querySelector(':scope>.field-description');
        if (description) {
            // Move description to the bottom
            fieldDiv.append(description);
        }
        if (fieldJson.properties.isRequired) {
            const input = document.createElement('input');
            input.required = true;
            input.type = 'text';
            input.style.display = 'none';
            const defaultErrorMsg = 'Please select at least one from up to four';
            fieldDiv.dataset.requiredErrorMessage = fieldJson.properties.requiredErrorMessage || defaultErrorMsg;
            fieldDiv.addEventListener('change', () => {
                const required = fieldDiv.querySelectorAll('input[type="checkbox"]:checked').length === 0;
                if (!required) {
                    updateOrCreateInvalidMsg(input);
                }
                input.required = required;
            });
            fieldDiv.append(input);
        }
        const toastTitleProp = fieldJson.properties.toastTitle;
        // set the 'data-toast-title' on the fieldDiv
        fieldDiv.setAttribute('data-toast-title', toastTitleProp);
        return fieldDiv;
    });
}
