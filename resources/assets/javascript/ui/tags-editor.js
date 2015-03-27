const createListItemFromTag = (templateEngine, tag) => {
   const listItem = templateEngine.create('editableTag');
   const name = listItem.getElementsByTagName('span')[0];
   const removeButton = listItem.getElementsByTagName('button')[0];

   name.textContent = tag;

   removeButton.addEventListener('click', () =>
      listItem.parentNode.removeChild(listItem));

   return listItem;
};

const getTagFromListItem = listItem => {
   const name = listItem.getElementsByTagName('span')[0];
   return name.textContent;
};

const templateEngineSymbol = Symbol('templateEngine');
const containerSymbol = Symbol('container');

export default class {
   constructor(templateEngine) {
      this[templateEngineSymbol] = templateEngine;
      this[containerSymbol] = templateEngine.create('tagsEditor');

      const addTagButton =
         this.element().getElementsByClassName('addButton')[0];

      addTagButton.addEventListener('click', () => {
         const tagInput = this.element().getElementsByTagName('input')[0];
         const tag = tagInput.value.trim();

         const tagsList = this.element().getElementsByTagName('ul')[0];
         tagsList.appendChild(createListItemFromTag(templateEngine, tag));

         tagInput.value = '';
         tagInput.focus();
      });
   }

   element() {
      return this[containerSymbol];
   }

   getTags() {
      return Array.from(this.element().getElementsByTagName('li'))
         .map(getTagFromListItem);
   }

   setTags(tags) {
      const tagsList = this.element().getElementsByTagName('ul')[0];
      tagsList.textContent = '';

      tags.forEach(tag =>
         tagsList.appendChild(
            createListItemFromTag(this[templateEngineSymbol], tag)));
   }
}
