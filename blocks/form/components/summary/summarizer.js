import { i18n } from '../../../../i18n/index.js';
import { FIELD_NAMES as WorkExperienceFieldNames } from '../workexperience/fieldnames.js';
import { FIELD_NAMES as EducationFieldNames } from '../education/fieldnames.js';
import { DefaultFieldConverter } from '../utils.js'

class WorkExperienceConverter {
    static canProcess(element) {
        return element.closest('[name="workexperience"]') != undefined;
    }

    static process(result) {

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

    static process(result) {
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

    static markupFromNameValues(nameValues) {

        const classPrefix = 'summary';
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

    static createMarkupObjects(entry) {
        let nameValues;
        try {
            nameValues = entry.dataset.data
                ? JSON.parse(entry.dataset.data)
                : Summarizer.fieldToNameValues(entry);
        } catch (e) {
            nameValues = Summarizer.fieldToNameValues(entry);
        }

        // Apply converters
        Summarizer.fieldConverters.forEach(fieldConverter => {
            if (fieldConverter.canProcess(entry)) {
                nameValues = fieldConverter.process(nameValues);
            }
        });

        return Summarizer.markupFromNameValues(nameValues);
    }

    static fieldToNameValues(element) {
        return new DefaultFieldConverter().convert(element);
    }

    static summaryTemplate = `
    <div class="row">
        <div class="col-md-5">
            <h4>{{title}}</h4>
            <div><a class="edit">${i18n('Edit')}</a></div>
        </div>
        <div class="col-md-7">{{content}}</div>
    </div>
    `;

    static itemContentEditTemplate = `
    <div class="row item">
        <div class="col-md-11">
            {{content}}
        </div>
        <div class="col-md-1">
            <div class="edit"><i></i><span>${i18n('Edit')}</span></div>
        </div>
    </div>
    `;

    static itemContentTemplate = `{{content}}`;

    static replace(template, params) {
        return template.replace(/{{(.*?)}}/g, (_, key) => params[key.trim()] ?? '');
    }

    static getItemContent(fieldset, showEdit) {
        const content = Summarizer.renderEntry(fieldset);

        const template = showEdit ? Summarizer.itemContentEditTemplate : Summarizer.itemContentTemplate;

        return Summarizer.replace(template, { content: content })
    }

    static createSummaryFromMarkupObjects(markupObjects) {
        const result = document.createElement('div');
        result.classList.add('summary-entry');

        markupObjects.forEach(mo => {
            result.append(mo);
        });

        return result.outerHTML;
    }

    static renderEntry(entry) {
        const markupObjects = Summarizer.createMarkupObjects(entry);

        return Summarizer.createSummaryFromMarkupObjects(markupObjects);
    }

    /* SUMMARIZERS */
    static defaultSummarizer(name, el, properties) {
        const form = el.closest('form');

        const entry = form.querySelector(`[name="${name}"]`);
        let content = '';
        if (entry) {
            content = Summarizer.getItemContent(entry, properties.showEdit);
        }

        return Summarizer.replace(Summarizer.summaryTemplate, { title: properties.title, content: content });
    }

    static defaultRepeatableSummarizer(name, el, properties) {
        const form = el.closest('form');

        let contents = [];

        const entries = form.querySelectorAll(`[name="${name}"] [data-repeatable].saved`);
        entries.forEach(entry => {
            let content = Summarizer.getItemContent(entry);
            contents.push(content);
        });

        return Summarizer.replace(Summarizer.summaryTemplate, { title: properties.title, content: contents.join('') });
    }

    static personal_details(el) {
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
                <div class="col-md-2"><a href="#" class="edit">${i18n('Edit')}</a></div>
            </div>
        `;
    }

    static personal_statement(el, properties) {
        el.innerHTML = Summarizer.defaultSummarizer('panel_personal_summary', el, properties);
    }

    static strengths(el, properties) {
        el.innerHTML = Summarizer.defaultRepeatableSummarizer('panel_strengths', el, properties);
    }

    static experience(el, properties) {
        el.innerHTML = Summarizer.defaultRepeatableSummarizer('panel_work_experiences', el, properties);
    }

    static languages(el, properties) {
        const form = el.closest('form');

        let languagesContent = [];

        // Read english language
        const englishFieldset = form.querySelector('fieldset[name="panel_english_skills"]');
        const nameValues = {
            language: { value: 'english', displayValue: i18n('English') },
            ...Summarizer.fieldToNameValues(englishFieldset)
        };

        // English content
        let languageContentMarkupObjects = Summarizer.markupFromNameValues(nameValues);
        let languageContent = Summarizer.createSummaryFromMarkupObjects(languageContentMarkupObjects);
        languageContent = Summarizer.replace(Summarizer.itemContentEditTemplate, { content: languageContent })

        languagesContent.push(languageContent);

        // Read other languages
        const otherLanguages = form.querySelectorAll('fieldset[name="panel_other_languages"] [data-repeatable].saved');
        const showEdit = true;
        otherLanguages.forEach(otherLanguage => {
            languageContent = Summarizer.getItemContent(otherLanguage, showEdit);
            if (languageContent) {
                languagesContent.push(languageContent);
            }
        });

        if (languagesContent.length > 0) {
            const content = Summarizer.replace(Summarizer.summaryTemplate, { title: properties.title, content: languagesContent.join('') });
            el.innerHTML = content;
        }
    }

    static driver_licence(el, properties) {
        el.innerHTML = Summarizer.defaultRepeatableSummarizer('panel_driver_licence', el, properties);
    }

    static education(el, properties) {
        el.innerHTML = Summarizer.defaultRepeatableSummarizer('panel_educations', el, properties);
    }

    static work_skills(el, properties) {
        el.innerHTML = Summarizer.defaultSummarizer('panel_work_skills', el, properties);
    }

    static skills(el, properties) {
        el.innerHTML = Summarizer.defaultSummarizer('panel_skills', el, properties);
    }

    static work_preferences(el, properties) {
        properties.showEdit = true;
        el.innerHTML = Summarizer.defaultSummarizer('panel_work_preferences', el, properties);
    }


}
