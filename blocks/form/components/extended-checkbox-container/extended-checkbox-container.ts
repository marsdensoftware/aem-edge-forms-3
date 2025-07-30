interface Field {
 [key: string]: any
 properties: {
  [key: string]: any
 }
}

export default function decorate(fieldDiv: Element, fieldJson: Field) {
 console.log('hi from extended-checkbox-container')
 fieldDiv.classList.add('extended-checkbox-container')


}
