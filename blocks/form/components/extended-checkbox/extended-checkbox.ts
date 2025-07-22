interface Field {
  [key: string]: any
  properties: {
    datasource: string
    [key: string]: any
  }
}

export default function decorate(fieldDiv: Element, fieldJson: Field) {
  console.log('hi from extended checkbox group');

  const {iconName} = fieldJson.properties;

  // if we have an iconName, then add the extended-checkbox--icon-${iconName} class to the fieldDiv
  if (iconName) {
    fieldDiv.classList.add(`extended-checkbox--icon-${iconName}`);
  }

  //create the divider
  const divider = document.createElement('hr')
  divider.classList.add('checkbox-divider')

  const textArea = document.createElement('textarea')
  textArea.classList.add('checkbox-description')
  textArea.placeholder = 'Enter description here'
  textArea.value = 'Copy here explaining an example of this skill etc over multiple lines as required. Copy here explaining an example of this skill etc over multiple lines as required.'

  fieldDiv.append(divider, textArea)

  return fieldDiv;

}
