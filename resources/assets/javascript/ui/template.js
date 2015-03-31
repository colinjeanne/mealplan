/**
 * Shorthand to know if a type if a string
 *
 * @function
 * 
 * @param  {Object} u The object to type check
 * 
 * @return {boolean}   Whether the object is a string
 */
const isString = s => typeof s === 'string';

/**
 * The name of the private property that stores the list of template elements
 * 
 * @global
 */
const templatesSymbol = Symbol('template.Templates');

/**
 * Finds a template by name amongst a list of template nodes
 * 
 * @param  {string}     name      The name of the template
 * @param  {NodeList}   templates A DOM NodeList of template elements
 * 
 * @return {Node} The template node
 */
const findTemplate = (name, templates) => {
   const templateElement = Array.from(templates).find(template => {
      if (template.dataset) {
         return template.dataset.templateName === name;
      }

      return template.getAttribute('data-template-name') === name;
   });

   if (!templateElement) {
      throw new Error(`Template "${name}" not found`);
   }

   return templateElement;
};

/**
 * @classdesc A simple template engine
 */
export default class {
   /**
    * Initializes the template engine with a root element from which to find
    * templates
    * 
    * @param  {Node} rootElement The DOM Node which has template descendants
    * 
    * @return {Template}
    */
   constructor(rootElement) {
      this[templatesSymbol] =
         rootElement.querySelectorAll('*[data-template-name]');
   }

   /**
    * Creates a template by name
    * 
    * @param  {string} name The name of the template
    * 
    * @return {Node} A node cloned from the template
    */
   create(name) {
      if (!isString(name)) {
         throw new TypeError('expected string');
      }

      const clone = findTemplate(name, this[templatesSymbol]).cloneNode(true);
      clone.removeAttribute('data-template-name');
      Array.from(clone.querySelectorAll('*[data-template-name]'))
         .forEach(innerTemplate =>
            innerTemplate.parentNode.removeChild(innerTemplate)
         );

      return clone;
   }
}
