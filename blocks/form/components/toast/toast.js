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
/**
 * Decorates a custom form field component
 * @param {HTMLElement} fieldDiv - The DOM element containing the field wrapper. Refer to the documentation
 * for its structure for each component.
 * @param {Object} fieldJson - The form json object for the component.
 * @param {HTMLElement} parentElement - The parent element of the field.
 * @param {string} formId - The unique identifier of the form.
 */
export default function decorate(fieldDiv, fieldJson, parentElement, formId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('⚙️ Decorating toast component:', fieldDiv, fieldJson, parentElement, formId);
        // TODO: Implement your custom component logic here
        // You can access the field properties via fieldJson.properties
        const { properties } = fieldJson;
        fieldDiv.classList.add('toast');
        // add the value of the type property as a class to the toast
        const type = properties === null || properties === void 0 ? void 0 : properties.toastType;
        fieldDiv.classList.add(type);
        // Create header container
        const headerContainer = document.createElement('div');
        headerContainer.classList.add('toast__header-container');
        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('toast__icon');
        // Create the title div
        const titleDiv = document.createElement('div');
        titleDiv.classList.add('toast__title');
        titleDiv.textContent = properties === null || properties === void 0 ? void 0 : properties.toastTitle;
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.classList.add('toast__close-button');
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close');
        // Add click event to close button
        closeButton.addEventListener('click', () => {
            fieldDiv.classList.add('toast__hidden');
        });
        // add the icon, title and close to the header container
        headerContainer.appendChild(iconContainer);
        headerContainer.appendChild(titleDiv);
        headerContainer.appendChild(closeButton);
        // Create the description div
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('toast__description');
        messageDiv.textContent = properties === null || properties === void 0 ? void 0 : properties.toastMessage;
        // Append elements to toast
        fieldDiv.appendChild(headerContainer);
        fieldDiv.appendChild(messageDiv);
        return fieldDiv;
    });
}
