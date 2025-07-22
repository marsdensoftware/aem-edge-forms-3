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

  // set up the structure of the component as:
  // <div class="checkbox-wrapper field-main-checkbox field-wrapper" data-id="checkbox-616739e2ec" data-required="false" data-component-status="loaded" data-active="true">
  // <input type="checkbox" value="on" id="checkbox-616739e2ec" name="main-checkbox" autocomplete="off">
  //     <label for="checkbox-616739e2ec" class="field-label">Checkbox Title</label>
  // <hr class="checkbox-divider">
  // <textarea class="checkbox-description" placeholder="Enter description here">Copy here explaining an example of this skill etc over multiple lines as required. Copy here explaining an example of this skill etc over multiple lines as required.</textarea>
  // </div>



  return fieldDiv;

}
