export default function decorate(el, model) {
    el.classList.add('formoutputfield-wrapper');
    
    // check model rendering type and decide how to render/format the output.
    // number,date,radio,checkbox,etc...

    return el;
}
