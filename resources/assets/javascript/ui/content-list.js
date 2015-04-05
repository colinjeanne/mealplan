const createListItem =
   (templateEngine, itemData) => {
      let listItem = templateEngine.create('contentListItem');
      let mainLine = listItem.getElementsByClassName('mainLine')[0];
      let detail = listItem.getElementsByClassName('detail')[0];

      mainLine.textContent = itemData.mainLine;
      detail.textContent = itemData.detail;

      listItem.addEventListener(
         'click',
         () => {
            itemData.handler(itemData.data)
         }
      );

      return listItem;
   }; 

const containerSymbol = Symbol('container');

export default class {
   constructor(templateEngine, items) {
      this[containerSymbol] = templateEngine.create('contentList');

      items
         .map(itemData =>
            createListItem(
               templateEngine,
               itemData))
         .forEach(this.element().appendChild, this.element());
   }

   element() {
      return this[containerSymbol];
   }
}
