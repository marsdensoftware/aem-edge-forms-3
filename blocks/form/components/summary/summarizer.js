import { i18n } from '../../../../i18n/index.js';
import { FIELD_NAMES as WorkExperienceFieldNames } from '../workexperience/fieldnames.js';
import { FIELD_NAMES as EducationFieldNames } from '../education/fieldnames.js';
import { FIELD_NAMES as DriverLicenceFieldNames } from '../driverlicence/fieldnames.js';
import { DefaultFieldConverter, isNo } from '../utils.js'

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

        const summary = [];

        const placeOfLearning = result[EducationFieldNames.PLACE_OF_LEARNING]?.displayValue;
        if (placeOfLearning) summary.push(placeOfLearning);

        newResult[EducationFieldNames.COURSE] = result[EducationFieldNames.COURSE];
        const startYear = result[EducationFieldNames.START_YEAR];

        // Customize rendering for completion-year, completion status
        const completionStatus = result[EducationFieldNames.COMPLETION_STATUS];
        if (completionStatus?.value == 0) {
            // Completed
            const endYear = result[EducationFieldNames.FINISH_YEAR];
            summary.push(`${i18n('Finished')} ${endYear.displayValue}`);
        }
        else if (completionStatus?.value == 1) {
            // In progress, partially completed
            summary.push(`${i18n('Started')} ${startYear.displayValue}`, `${i18n('Partially complete')}`);
        }
        else {
            // Not completed
            summary.push(`${i18n('Started')} ${startYear.displayValue}`, `${completionStatus.displayValue}`);
        }

        const value = summary?.length ? `${summary.join(', ')}.` : '';
        newResult.summary = { value, displayValue: value };

        return newResult;
    }
}

class DriverLicenceConverter {
    static process(result) {
        const newResult = {};

        // Customize rendering for licence class/stage
        const licenceClass = result[DriverLicenceFieldNames.LICENCE_CLASS];
        if (licenceClass.value) {
            licenceClass.values = [licenceClass.value];
            licenceClass.displayValues = [licenceClass.displayValue];
        }

        newResult[DriverLicenceFieldNames.LICENCE_CLASS] = { values: [], displayValues: [] };
        const hasEndorsements = !isNo(result[DriverLicenceFieldNames.ENDORSEMENTS_AVAILABLE]);
        if (hasEndorsements) {
            newResult[DriverLicenceFieldNames.ENDORSEMENTS] = result[DriverLicenceFieldNames.ENDORSEMENTS];
        }

        licenceClass.values.forEach((value, index) => {
            const stage = result[`class${value}-stage`];
            const displayValue = licenceClass.displayValues[index];

            newResult[DriverLicenceFieldNames.LICENCE_CLASS].values.push(`${value}-${stage.value}`);
            newResult[DriverLicenceFieldNames.LICENCE_CLASS].displayValues.push(`${displayValue} - ${stage.displayValue}`);
        });

        return newResult;
    }
}

export class Summarizer {

    // List of converters
    static fieldConverters = [
        WorkExperienceConverter,
        EducationConverter
    ];

    static navigate(wizardEl, index) {
        const current = wizardEl.querySelector('.current-wizard-step');
        const currentMenuItem = wizardEl.querySelector('.wizard-menu-active-item');

        const navigateTo = wizardEl.querySelector(`:scope>[data-index="${index}"]`);

        if (navigateTo) {
            current.classList.remove('current-wizard-step');
            navigateTo.classList.add('current-wizard-step');
            // add/remove active class from menu item
            const navigateToMenuItem = wizardEl.querySelector(`li[data-index="${navigateTo.dataset.index}"]`);
            currentMenuItem.classList.remove('wizard-menu-active-item');
            navigateToMenuItem.classList.add('wizard-menu-active-item');

            const event = new CustomEvent('wizard:navigate', {
                detail: {
                    prevStep: { id: current.id, index: +current.dataset.index },
                    currStep: { id: navigateTo.id, index: +navigateTo.dataset.index },
                },
                bubbles: true,
            });

            wizardEl.dispatchEvent(event);
        }
    }

    static markupFromNameValues(nameValues, properties) {

        const classPrefix = 'summary';
        const entries = [];
        let tagName = 'div';
        if (properties && properties.summaryEntryItemsTag) {
            tagName = properties.summaryEntryItemsTag;
        }

        Object.entries(nameValues).forEach(([name, data]) => {
            if (!data) return;
            const value = data.value;
            const displayValue = data.displayValue;

            if (value) {
                const result = document.createElement(tagName);
                result.classList.add(`${classPrefix}-entry__${name}`);
                result.dataset.value = value;
                result.dataset.name = name;
                result.innerHTML = displayValue;

                entries.push(result);
            }

            const values = data.values;
            const displayValues = data.displayValues;
            if (values) {
                const result = document.createElement(tagName);
                result.classList.add(`${classPrefix}-entry__${name}`);
                result.dataset.values = values;
                result.innerHTML = displayValues.join(', ');

                entries.push(result);
            }
        });

        return entries;
    }

    static getNameValues(entry) {
        let nameValues = undefined;
        try {
            nameValues = entry.dataset.data
                ? JSON.parse(entry.dataset.data)
                : Summarizer.fieldToNameValues(entry);
        } catch (e) {
            nameValues = Summarizer.fieldToNameValues(entry);
        }

        return nameValues;
    }

    static createMarkupObjects(entry, properties) {
        let nameValues = Summarizer.getNameValues(entry);

        // Apply converters
        Summarizer.fieldConverters.forEach(fieldConverter => {
            if (fieldConverter.canProcess(entry)) {
                nameValues = fieldConverter.process(nameValues);
            }
        });

        return Summarizer.markupFromNameValues(nameValues, properties);
    }

    static fieldToNameValues(element) {
        return new DefaultFieldConverter().convert(element);
    }

    static gotoWizardStep(el) {
        const stepName = el.dataset.stepName;
        const entryId = el.dataset.entryId;

        const form = el.closest('form');

        const panelEl = form.querySelector(`[name="${stepName}"]`);
        const wizardEl = panelEl.closest('.wizard');
        const index = panelEl.dataset.index;

        Summarizer.navigate(wizardEl, index);

        if (entryId) {
            const editEl = panelEl.querySelector(`[data-id="${entryId}"] .repeatable-entry__edit`);
            if (editEl) {
                // Switch to edit mode by triggering click on edit link;
                editEl.click();
            }
        }
    }

    static summaryEditTemplate = `
    <div class="row">
        <div class="col-md-5">
            <h4 class="title">{{title}}</h4>
            {{description}}
            <div><a class="edit" href="#" data-step-name="{{stepName}}">${i18n('Edit')}</a></div>
        </div>
        <div class="col-md-7">{{content}}</div>
    </div>
    `;

    static summaryTemplate = `
    <div class="row">
        <div class="col-md-5">
            <h4 class="title">{{title}}</h4>
            {{description}}
        </div>
        <div class="col-md-7">{{content}}</div>
    </div>
    `;

    static itemContentEditTemplate = `
    <div class="row summary-entry">
        <div class="col-md-11">
            {{content}}
        </div>
        <div class="col-md-1">
            <a class="edit" href="#" data-step-name="{{stepName}}" data-entry-id="{{entryId}}">${i18n('Edit')}</a>
        </div>
    </div>
    `;

    static itemContentTemplate = `<{{summaryEntryTag}} class="row summary-entry">{{content}}</{{summaryEntryTag}}>`;

    static replace(template, params) {
        return template.replace(/{{(.*?)}}/g, (_, key) => params[key.trim()] ?? '');
    }

    static getItemContent(fieldset, stepName, properties) {
        const content = Summarizer.renderEntry(fieldset, properties);
        const entryId = fieldset.dataset.id;
        const showEdit = properties && properties.showEdit;
        let summaryEntryTag = 'div';

        if (properties && properties.summaryEntryTag) {
            summaryEntryTag = properties.summaryEntryTag;
        }

        const template = showEdit ? Summarizer.itemContentEditTemplate : Summarizer.itemContentTemplate;

        return Summarizer.replace(template, { content, stepName, entryId, summaryEntryTag })
    }

    static createSummaryFromMarkupObjects(markupObjects) {
        let summaryEntryItemsTag = 'div';

        const result = document.createElement(summaryEntryItemsTag);

        markupObjects.forEach(mo => {
            result.append(mo);
        });

        return result.innerHTML;
    }

    static renderEntry(entry, properties) {
        const markupObjects = Summarizer.createMarkupObjects(entry, properties);

        return Summarizer.createSummaryFromMarkupObjects(markupObjects);
    }

    /* SUMMARIZERS */
    static defaultSummarizer(stepName, el, properties) {
        const form = el.closest('form');

        const entry = form.querySelector(`[name="${stepName}"]`);
        let content = '';
        if (entry) {
            content = Summarizer.getItemContent(entry, stepName, properties);
        }
        
        const description = properties['description'];
        const descriptionHtml = description ? `<p class="p-small">${description}</p>` : "";

        return Summarizer.replace(Summarizer.summaryEditTemplate, { stepName: stepName, title: properties.title, description: descriptionHtml, content: content });
    }

    static defaultRepeatableSummarizer(stepName, el, properties) {
        const form = el.closest('form');

        let contents = [];

        const entries = form.querySelectorAll(`[name="${stepName}"] [data-repeatable].saved`);
        entries.forEach(entry => {
            let content = Summarizer.getItemContent(entry, stepName);
            contents.push(content);
        });
        
        
        const description = properties['description'];
        const descriptionHtml = description ? `<p class="p-small">${description}</p>` : "";

        return Summarizer.replace(Summarizer.summaryEditTemplate, { stepName: stepName, title: properties.title, description: descriptionHtml, content: contents.join('') });
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
                <div class="col-md-3 address"><i></i><span>${address}</span></div>
                <div class="col-md-2 phone"><i></i><span>${phone}</phone></div>
                <div class="col-md-4 email"><i></i><span>${email}</span></div>
                <div class="col-md-1"><a href="#" class="edit" data-step-name="panel_personal_details">${i18n('Edit')}</a></div>
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
        languageContent = Summarizer.replace(Summarizer.itemContentEditTemplate, { stepName: 'panel_english_skills', content: languageContent })

        languagesContent.push(languageContent);

        // Read other languages
        const otherLanguages = form.querySelectorAll('fieldset[name="panel_other_languages"] [data-repeatable].saved');
        properties.showEdit = true;
        otherLanguages.forEach(otherLanguage => {
            languageContent = Summarizer.getItemContent(otherLanguage, 'panel_other_languages', properties);
            if (languageContent) {
                languagesContent.push(languageContent);
            }
        });

        if (languagesContent.length > 0) {
            const description = properties['description'];
            const descriptionHtml = description ? `<p class="p-small">${description}</p>` : "";
            const content = Summarizer.replace(Summarizer.summaryTemplate, { title: properties.title, description: descriptionHtml , content: languagesContent.join('') });
            el.innerHTML = content;
        }
    }

    static driver_licence(el, properties) {
        const form = el.closest('form');
        const stepName = 'panel_driver_licence';

        const entry = form.querySelector(`[name="${stepName}"] [data-repeatable].saved`);
        const contents = [];

        if (entry) {
            let nameValues = Summarizer.getNameValues(entry);
            nameValues = DriverLicenceConverter.process(nameValues);

            const entries = [
                {
                    'licenceClassTitle': {
                        value: 'licence-class-title',
                        displayValue: i18n('Classes')
                    }
                    ,
                    'licence-class': nameValues[DriverLicenceFieldNames.LICENCE_CLASS]
                }
            ];

            if (nameValues[DriverLicenceFieldNames.ENDORSEMENTS]) {
                entries.push(
                    {
                        'endorsementsTitle': {
                            value: 'endorsements-title',
                            displayValue: i18n('Endorsements')
                        },

                        'endorsements': nameValues[DriverLicenceFieldNames.ENDORSEMENTS]
                    }
                );
            }

            entries.forEach(entryNameValues => {
                const markupObjects = Summarizer.markupFromNameValues(entryNameValues);
                let content = Summarizer.createSummaryFromMarkupObjects(markupObjects);
                content = Summarizer.replace(Summarizer.itemContentTemplate, { content: content, summaryEntryTag: 'div' })
                contents.push(content);
            });
        }
        
        const description = properties['description'];
        const descriptionHtml = description ? `<p class="p-small">${description}</p>` : "";

        const content = Summarizer.replace(Summarizer.summaryEditTemplate, { stepName: stepName, title: properties.title, description: descriptionHtml, content: contents.join('') });
        el.innerHTML = content;
    }

    static education(el, properties) {
        el.innerHTML = Summarizer.defaultRepeatableSummarizer('panel_educations', el, properties);
    }

    static work_related_skills(el, properties) {
        properties.summaryEntryTag = 'ul';
        properties.summaryEntryItemsTag = 'li';

        el.innerHTML = Summarizer.defaultSummarizer('panel_work_related_skills', el, properties);
    }

    static skills(el, properties) {
        properties.summaryEntryTag = 'ul';
        properties.summaryEntryItemsTag = 'li';

        el.innerHTML = Summarizer.defaultSummarizer('panel_skills', el, properties);
    }

    static work_preferences(el, properties) {

        function getContent(workEntryFieldset, stepName, title) {
          const nameValues = {
            title: { value: stepName, displayValue: title },
            ...Summarizer.fieldToNameValues(workEntryFieldset),
          }
    
          if (stepName == 'panel_work_availability') {
            if (
              nameValues['days_you_can_work'] &&
              nameValues['days_you_can_work'].value
            ) {
              nameValues['days_you_can_work'].values = [
                nameValues['days_you_can_work'].value,
              ]
              nameValues['days_you_can_work'].displayValues = [
                nameValues['days_you_can_work'].displayValue,
              ]
    
              delete nameValues['days_you_can_work'].value
              delete nameValues['days_you_can_work'].displayValue
            }
    
            if (
              nameValues['days_you_can_work'] &&
              nameValues['days_you_can_work'].values &&
              nameValues['days_you_can_work'].values.indexOf('3') > -1
            ) {
              // Specific days
              const index = nameValues['days_you_can_work'].values.indexOf('3')
    
              if (
                nameValues['specific_days_cb'] &&
                nameValues['specific_days_cb'].value
              ) {
                nameValues['specific_days_cb'].values = [
                  nameValues['specific_days_cb'].value,
                ]
                nameValues['specific_days_cb'].displayValues = [
                  nameValues['specific_days_cb'].displayValue,
                ]
    
                delete nameValues['specific_days_cb'].value
                delete nameValues['specific_days_cb'].displayValue
              }
              
              if(nameValues['specific_days_cb']){
                nameValues['days_you_can_work'].displayValues[index] =
                nameValues['specific_days_cb'].displayValues.join(', ')
    
                delete nameValues['specific_days_cb']
              }
              else{
                  delete nameValues['days_you_can_work'].displayValues[index];
              }
            }
            else{
                delete nameValues['specific_days_cb'];
            }
          }
    
          if (
            stepName == 'panel_working_locations' &&
            nameValues['reliable-transport']
          ) {
            if (isNo(nameValues['reliable-transport'])) {
              nameValues['reliable-transport'].displayValue = i18n(
                "I don't have reliable transport to get to work",
              )
            } else {
              nameValues['reliable-transport'].displayValue = i18n(
                'I have reliable transport to get to work',
              )
            }
          }
    
          // Content
          let contentMarkupObjects = Summarizer.markupFromNameValues(nameValues)
          let content =
            Summarizer.createSummaryFromMarkupObjects(contentMarkupObjects)
    
          return Summarizer.replace(Summarizer.itemContentEditTemplate, {
            stepName,
            content,
          })
        }

        const form = el.closest('form');

        // Combines 3_2_jobs, 3_3_hours, 3_4_work_availability, 3_5_work_location
        const childrenNames = [
            ['panel_jobs', i18n('Work you’re interested in')],
            ['panel_hours', i18n('Hours you’re looking for')],
            ['panel_work_availability', i18n('Work availability')],
            ['panel_working_locations', i18n('Work location')]
        ];
        const contents = [];

        childrenNames.forEach(step => {
            const stepName = step[0];
            const title = step[1];

            const entry = form.querySelector(`[name="${stepName}"]`);

            if (entry) {
                const content = getContent(entry, stepName, title);
                contents.push(content);
            }
        });
        
        const description = properties['description'];
        const descriptionHtml = description ? `<p class="p-small">${description}</p>` : "";

        el.innerHTML = Summarizer.replace(Summarizer.summaryTemplate, { title: properties.title, description: descriptionHtml, content: contents.join('') });
    }
}
