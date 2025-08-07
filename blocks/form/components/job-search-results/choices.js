
// Location Dropdown — single select
const locationDropdown = document.querySelector('.select-location-dropdown select');

if (locationDropdown) {
  new Choices(locationDropdown, {
    searchEnabled: true,
    placeholder: true,
    itemSelectText: '',
    shouldSort: false,
    classNames: {
      containerOuter: 'choices location-dropdown-choices',
    },
  });
}

// Job Type Dropdown — multi select with checkboxes
const jobTypeDropdown = document.querySelector('.job-type-multiselect select');

if (jobTypeDropdown) {
  new Choices(jobTypeDropdown, {
    removeItemButton: true,
    searchEnabled: false,
    placeholder: true,
    itemSelectText: '',
    shouldSort: false,
    classNames: {
      containerOuter: 'choices job-type-dropdown-choices',
    },
    callbackOnCreateTemplates: function(template) {
      return {
        item: (classNames, data) => {
          return template(`
            <div class="\${classNames.item} \${data.highlighted ? classNames.highlightedState : classNames.itemSelectable}"
                 data-item
                 data-id="\${data.id}"
                 data-value="\${data.value}"
                 \${data.active ? 'aria-selected="true"' : ''}
                 \${data.disabled ? 'aria-disabled="true"' : ''}>
              <span class="checkbox-icon"></span>
              \${data.label}
            </div>
          `);
        },
        choice: (classNames, data) => {
          return template(`
            <div class="\${classNames.item} \${classNames.itemChoice} \${data.disabled ? classNames.itemDisabled : classNames.itemSelectable}"
                 data-select-text=""
                 data-choice
                 data-id="\${data.id}"
                 data-value="\${data.value}"
                 \${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'}
                 \${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
              <span class="checkbox-icon"></span>
              \${data.label}
            </div>
          `);
        }
      };
    }
  });
}
