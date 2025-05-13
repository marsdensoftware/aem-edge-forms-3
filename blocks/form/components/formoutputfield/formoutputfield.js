
function waitForWindowObject(key) {
    return new Promise((resolve) => {
        const check = () => {
            if (window[key]) {
                resolve(window[key]);
            } else {
                setTimeout(check, 100); // check again in 100ms
            }
        };

        check();
    });
}

export default function decorate(fieldDiv, fieldJson) {
    // get the input element from the fieldDiv
    waitForWindowObject('myForm').then((form) => {
        console.log('Form is available:', form);
        const field = form.getElement(fieldJson.id);
        if (field) {
            // Subscribe to field change event
            field.subscribe((payload) => {
                const { changes, field: fieldModel } = payload;
                const {
                    id, name, fieldType, ':type': componentType, readOnly, type, displayValue, displayFormat, displayValueExpression,
                    activeChild,
                } = fieldModel;
            }, 'fieldChanged');
        }
    });

    return fieldDiv;
}
