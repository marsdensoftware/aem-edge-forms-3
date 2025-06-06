
import { decorate as typeaheadDecorator } from '../typeahead/typeahead.js';

export function decorate(element, field) {
    // Add search-box specific class
    element.classList.add('search-box');
    
    // Use typeahead decorator for rendering if specified
    if (field.properties['fd:render'] === 'typeahead') {
        typeaheadDecorator(element, field);
    }

    return element;
}