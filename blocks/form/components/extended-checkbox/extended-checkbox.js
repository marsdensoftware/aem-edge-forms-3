/**
 * Decorates a checkbox group by adding a description span below each option's label.
 * @param {HTMLFieldSetElement} fieldset The fieldset element for the checkbox group.
 * @param {object} fieldDef The form field definition object.
 */
export default function decorate(fieldset, fieldDef) {

  console.log('hi from extended checkbox');

  // Get the descriptions from the field definition, defaulting to an empty array.
  const descriptions = fieldDef.properties?.enumDescriptions || [];
  if (descriptions.length === 0) {
    return; // No descriptions to add, so we're done.
  }

  // Find all the individual checkbox labels within this group.
  const labels = fieldset.querySelectorAll('.checkbox-wrapper label');

  labels.forEach((label, index) => {
    // Only proceed if a description exists for this specific checkbox.
    const descriptionText = descriptions[index];
    if (descriptionText) {
      // Create the new span for the description.
      const descSpan = document.createElement('span');
      descSpan.className = 'desc';
      descSpan.textContent = descriptionText;

      // Append the description span to the label.
      label.appendChild(descSpan);

      // Add a class to the label for easier CSS styling.
      label.classList.add('field-label--with-description');
    }
  });
}
