import { i18n } from '../../../../i18n/index.js';
import { fieldToNameValues } from '../utils.js'

export class Summarizers {

    static summaryTemplate = `
    <div class="row">
        <div class="col-md-5">
            <h4>{{title}}</h4>
            <div><i></i><span>${i18n('Edit')}</span></div>
        </div>
        <div class="col-md-7">{{content}}</div>
    </div>
    `;

    static itemTemplate = `
    <div class="row item">
        <div class="col-md-11">
            <p><b>{{title}}</b></p>
            <p>{{content}}</p>
        </div>
        <div class="col-md-1"><div><i></i><span>${i18n('Edit')}</span></div></div>
    </div>
    `;

    static replace(template, params) {
        return template.replace(/{{(.*?)}}/g, (_, key) => params[key.trim()] ?? '');
    }

    static languages(el, properties) {
        properties.title = title(properties);

        // Read english language
        const englishField = el.closest('form').querySelector('[name="cb_english_proficiency"]');
        const data = fieldToNameValues(englishField);
        const englishProficiency = data['cb_english_proficiency'];
        let itemContent = '';
        if (englishProficiency.displaValue) {
            itemContent = englishProficiency.displaValue;
        }

        if (englishProficiency.displayValues) {
            itemContent = englishProficiency.displaValues.join(', ');
        }

        itemContent = replace(itemTemplate, { title: i18n('English'), content: itemContent });

        // TODO Read other languages

        const content = replace(sthis.summaryTemplate, { title: properties.title, content: itemContent });
        el.innerHTML = content;
    }

    static title(properties) {
        // read configured title
        return properties['jcr:title'] || 'Title here';
    }

    static personalDetails(el) {

    }

    static personalStatement(el) {

    }

    static education(el) {

    }

    static experience(el) {

    }

    static driverLicence(el) {

    }

    static strengths(el) {

    }
}
