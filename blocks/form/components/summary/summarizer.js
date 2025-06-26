import { i18n } from '../../../../i18n/index.js';
import { getDurationString } from '../utils.js'
import { FIELD_NAMES as WorkExperienceFieldNames } from '../workexperience/fieldnames.js';
import { FIELD_NAMES as EducationFieldNames } from '../education/fieldnames.js';

class DefaultFieldConverter {

    static process(element) {
        let result = [];

        const inputs = element.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            const value = input.value;;
            let displayValue = value;
            const name = input.name;

            const type = input.type;

            if (input.tagName === 'SELECT') {
                displayValue = input.options[input.selectedIndex]?.text.trim() || '';
            }
            else if (type === 'checkbox' || type === 'radio') {
                // Ignore not checked
                if (!input.checked) {
                    return;
                }

                displayValue = input.checked ? input.parentElement.querySelector('label').textContent.trim() : '';
            }

            if (value) {
                if (result[name]) {
                    // multi values
                    const e = result[name];
                    if (!e.values) {
                        e.values = [];
                        e.values.push(e.value);
                        delete e.value;
                        e.displayValues = [];
                        e.displayValues.push(e.displayValue);
                        delete e.displayValue;
                    }
                    e.values.push(value);
                    e.displayValues.push(displayValue);
                }
                else {
                    result[name] = { 'value': value, 'displayValue': displayValue };
                }
            }
            else {
                if (type === 'checkbox' || type === 'radio') {
                    alert(`Name: ${name}, Value: ${value}`);
                }
            }
        });

        return result;
    }
}

class WorkExperienceConverter {
    static canProcess(element) {
        return element.closest('[name="workexperience"]') != undefined;
    }

    static process(element, result) {

        // Customize rendering for completion-year, completion status
        const stillWorking = result[WorkExperienceFieldNames.STILL_WORKING];
        const startYear = result[WorkExperienceFieldNames.START_OF_WORK_YEAR].value;
        let employmentDetails = result[WorkExperienceFieldNames.EMPLOYER_NAME].displayValue;

        let endYear;
        if (stillWorking.value == '0') {
            // No longer working
            endYear = result[WorkExperienceFieldNames.END_OF_WORK_YEAR].value;
            employmentDetails += `, ${startYear} - ${endYear}`;
        }
        else {
            // Still working
            employmentDetails += `, ${i18n('Started')} ${startYear}`;
        }

        const newResult = {};
        newResult[WorkExperienceFieldNames.JOB_TITLE] = result[WorkExperienceFieldNames.JOB_TITLE];
        newResult.employmentDetails = {
            value: employmentDetails,
            displayValue: employmentDetails
        };
        newResult[WorkExperienceFieldNames.DESCRIPTION] = result[WorkExperienceFieldNames.DESCRIPTION];

        return newResult;
    }
}

class EducationConverter {
    static canProcess(element) {
        return element.closest('[name="education"]') != undefined;
    }

    static process(element, result) {
        const newResult = {};

        newResult[EducationFieldNames.COURSE] = result[EducationFieldNames.COURSE];
        let summary = result[EducationFieldNames.PLACE_OF_LEARNING].displayValue;
        const startYear = result[EducationFieldNames.START_YEAR];

        // Customize rendering for completion-year, completion status
        const completionStatus = result[EducationFieldNames.COMPLETION_STATUS];
        if (completionStatus?.value == '0') {
            // Completed
            const endYear = result[EducationFieldNames.FINISH_YEAR];
            summary += `, ${i18n('Finished')} ${endYear.displayValue}`;
        }
        else {
            // Partially completed
            summary += `, ${i18n('Started')} ${startYear.displayValue}, ${i18n('Partially complete')}.`
        }

        newResult.summary = { value: summary, displayValue: summary };

        return newResult;
    }
}

export class Summarizer {

    // List of converters
    static fieldConverters = [
        WorkExperienceConverter,
        EducationConverter
    ];

    static entryToReadableString(entry, fieldConverters, classPrefix) {
        const nameValues = Summarizer.fieldToNameValues(entry, fieldConverters)
        const entries = [];

        Object.entries(nameValues).forEach(([name, data]) => {
            const value = data.value;
            const displayValue = data.displayValue;

            if (value) {
                const result = document.createElement('div');
                result.classList.add(`${classPrefix}-entry__${name}`);
                result.dataset.value = value;
                result.dataset.name = name;
                result.innerHTML = displayValue;

                entries.push(result);
            }

            const values = data.values;
            const displayValues = data.displayValues;
            if (values) {
                const result = document.createElement('div');
                result.classList.add(`${classPrefix}-entry__${name}`);
                result.dataset.values = values;
                result.innerHTML = displayValues.join(', ');

                entries.push(result);
            }
        });

        return entries;
    }

    static fieldToNameValues(element, fieldConverters) {
        let result = DefaultFieldConverter.process(element);
        // Apply converters if any
        if (fieldConverters) {
            fieldConverters.forEach(fieldConverter => {
                if (fieldConverter.canProcess(element, result)) {
                    result = fieldConverter.process(element, result);
                }
            });
        }

        return result;
    }

    static summaryTemplate = `
    <div class="row">
        <div class="col-md-5">
            <h4>{{title}}</h4>
            <div class="edit"><i></i><span>${i18n('Edit')}</span></div>
        </div>
        <div class="col-md-7">{{content}}</div>
    </div>
    `;

    static itemContentEditTemplate = `
    <div class="row item">
        <div class="col-md-11">
            <p><b>{{title}}</b></p>
            {{content}}
        </div>
        <div class="col-md-1">
            <div class="edit"><i></i><span>${i18n('Edit')}</span></div>
        </div>
    </div>
    `;

    static itemContentTemplate = `
    <div class="row item">{{content}}</div>
    `;

    static replace(template, params) {
        return template.replace(/{{(.*?)}}/g, (_, key) => params[key.trim()] ?? '');
    }

    static getItemContent(fieldset, showEdit) {
        const content = Summarizer.renderEntry(fieldset);

        const template = showEdit ? Summarizer.itemContentEditTemplate : Summarizer.itemContentTemplate;

        return Summarizer.replace(template, { content: content })
    }

    static renderEntry(entry) {
        const readable = Summarizer.entryToReadableString(entry, Summarizer.fieldConverters, 'summary');

        const result = document.createElement('div');
        result.classList.add('summary-entry');

        readable.forEach(r => {
            result.append(r);
        });

        return result.outerHTML;
    }

    /* SUMMARIZERS */

    static languages(el, properties) {
        const form = el.closest('form');

        function getEnglishContent(fieldset) {
            const data = Summarizer.fieldToNameValues(fieldset);
            const proficiency = data['cb_english_proficiency'];
            if (!proficiency) {
                return undefined;
            }
            const languageTitle = i18n('English');
            let content = '';

            if (proficiency?.displayValue) {
                content = proficiency.displayValue;
            }

            if (proficiency?.displayValues) {
                content = proficiency.displayValues.join(', ');
            }

            return Summarizer.replace(Summarizer.itemContentEditTemplate, { title: languageTitle, content: content })
        }

        let languagesContent = [];

        // Read english language
        const languageFieldset = form.querySelector('fieldset[name="panel_english_skills"]');
        let languageContent = getEnglishContent(languageFieldset);

        languagesContent.push(languageContent);

        // Read other languages
        const otherLanguages = form.querySelectorAll('fieldset[name="panel_other_languages"] [data-repeatable].saved');
        otherLanguages.forEach(otherLanguage => {
            languageContent = Summarizer.getItemContent(otherLanguage, true);
            if (languageContent) {
                languagesContent.push(languageContent);
            }
        });

        if (languagesContent.length > 0) {
            const content = Summarizer.replace(Summarizer.summaryTemplate, { title: properties.title, content: languagesContent.join('') });
            el.innerHTML = content;
        }
    }

    static personalDetails(el, properties) {
        const form = el.closest('form');

        // TODO Read from API
        const fullname = form.querySelector('.field-fullname').textContent.trim();
        const phone = form.querySelector('.field-phone').textContent.trim();
        const email = form.querySelector('.field-email').textContent.trim();
        const address = form.querySelector('.field-address').textContent.trim();

        el.innerHTML = `
            <h2>${fullname}</h2>
            <div class="row">
                <div class="col-md-4 address"><i></i><span>${address}</span></div>
                <div class="col-md-2 phone"><i></i><span>${phone}</phone></div>
                <div class="col-md-3 email"><i></i><span>${email}</span></div>
                <div class="col-md-2 edit"><i></i><span>${i18n('Edit')}</span></div>
            </div>
        `;
    }

    static personalStatement(el, properties) {
        const form = el.closest('form');

        const entry = form.querySelector('[name="panel_personal_summary"]');
        let content = Summarizer.getItemContent(entry);

        content = Summarizer.replace(Summarizer.summaryTemplate, { title: properties.title, content: content });
        el.innerHTML = content;
    }

    static education(el, properties) {
        const form = el.closest('form');

        let contents = [];

        const entries = form.querySelectorAll('[name="panel_educations"] [data-repeatable].saved');
        entries.forEach(entry => {
            let content = Summarizer.getItemContent(entry);
            contents.push(content);
        });

        const content = Summarizer.replace(Summarizer.summaryTemplate, { title: properties.title, content: contents.join('') });
        el.innerHTML = content;
    }

    static experience(el, properties) {
        const form = el.closest('form');

        let contents = [];

        const entries = form.querySelectorAll('[name="panel_work_experiences"] [data-repeatable].saved');
        entries.forEach(entry => {
            let content = Summarizer.getItemContent(entry);
            contents.push(content);
        });

        const content = Summarizer.replace(Summarizer.summaryTemplate, { title: properties.title, content: contents.join('') });
        el.innerHTML = content;
    }

    static driverLicence(el, properties) {

    }

    static strengths(el, properties) {

    }
}
