import { Education } from './education/education.js';
import { RepeatablePanel } from './default/default.js'

// Factory class
export class RepeatablePanelFactory {
    static createRepeatablePanel(el, field) {
        const renderer = field.properties.renderer || '';
        const panel = el.closest('.repeat-wrapper');
        let obj;
        switch (renderer.toLowerCase()) {
            case 'education':
                obj = new Education(panel);
                break;
            default:
                obj = new RepeatablePanel(panel);
                break;
        }

        obj.renderOverview();
    }
}