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
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
function decorate(block) {
    return __awaiter(this, void 0, void 0, function* () {
        // load nav as fragment
        const navMeta = getMetadata('nav');
        const navPath = navMeta
            ? new URL(navMeta, window.location.href).pathname
            : '/nav';
        // eslint-disable-next-line no-unused-vars
        yield loadFragment(navPath);
        block.textContent = '';
        const nav = document.createElement('nav');
        nav.id = 'nav';
        nav.className = 'nav';
    });
}
export default decorate;
