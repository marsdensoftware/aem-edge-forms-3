import { Education } from './education/education';
import { RepeatablePanel } from './default/default'

// Factory class
export class RepeatablePanelFactory {
    static createRepeatablePanel(el, field) {
        const renderer = field.properties.renderer || '';
        const panel = el.closest('.repeat-wrapper');

        switch (renderer.toLowerCase()) {
            case 'education':
                return new Education(panel);
            default:
                return new RepeatablePanel(panel);
        }
    }
}