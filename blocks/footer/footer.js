var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default function decorate(block) {
    return __awaiter(this, void 0, void 0, function* () {
        // load footer as fragment
        const footerMeta = getMetadata('footer');
        const footerPath = footerMeta
            ? new URL(footerMeta, window.location.href).pathname
            : '/footer';
        const fragment = yield loadFragment(footerPath);
        // decorate footer DOM
        block.textContent = '';
        const footer = document.createElement('div');
        while (fragment.firstElementChild)
            footer.append(fragment.firstElementChild);
        // block.append(footer)
    });
}
