
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
            field.subscribe((e) => {
                // Subscribe to field change event

            }, 'fieldChanged');
        }
    });

    return fieldDiv;
}
