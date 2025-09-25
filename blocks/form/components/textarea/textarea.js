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
 */
export default function decorate(fieldDiv, fieldJson) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        fieldDiv.classList.add('textarea');
        // eslint-disable-next-line prefer-destructuring
        const rows = fieldJson.properties.rows;
        if (rows) {
            (_a = fieldDiv.querySelector('textarea')) === null || _a === void 0 ? void 0 : _a.setAttribute('rows', rows);
        }
        return fieldDiv;
    });
}
