const createListItem = (document, listing) => {
   const listItem = document.createElement('li');
   listItem.textContent = listing.title;

   listItem.addEventListener('click', () => {
      if (listing.handler) {
         listing.handler(listing.data);
      }
   });

   return listItem;
};

export default class {
   constructor(container) {
      this.container = container;
   }

   updateListings(listings) {
      if (!Array.isArray(listings)) {
         throw new TypeError('expected array');
      }

      const listItems = listings.map(
         listing => createListItem(this.container.ownerDocument, listing));

      this.clear();

      listItems.forEach(listItem => this.container.appendChild(listItem));
   }

   clear() {
      this.container.textContent = '';
   }
}
