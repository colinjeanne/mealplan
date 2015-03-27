const createShoppingListListItem =
   (templateEngine, shoppingList, shoppingListItem) => {
      const listItem = templateEngine.create('shoppingListItem');
      const item = listItem.getElementsByTagName('span')[0];
      const removeButton = listItem.getElementsByTagName('button')[0];

      item.textContent = shoppingListItem;

      removeButton.addEventListener('click', () => {
         const index = shoppingList.items.indexOf(shoppingListItem);
         shoppingList.items.splice(index, 1);
         removeButton.disabled = true;

         shoppingList.save()
            .then(() => listItem.parentNode.removeChild(listItem))
            .catch(err => {
               removeButton.disabled = false;
               throw err;
            });
      });

      return listItem;
   }

export default class {
   constructor(templateEngine, shoppingList) {
      this.view = templateEngine.create('displayShoppingList');

      const list = this.view.getElementsByTagName('ul')[0];
      const addItemButton =
            this.view.getElementsByClassName('addToShoppingList')[0];
      const clearShoppingListButton =
            this.view.getElementsByClassName('clearShoppingList')[0];

      shoppingList.items.forEach(shoppingListItem => {
         const listItem = createShoppingListListItem(
            templateEngine,
            shoppingList,
            shoppingListItem
         );

         list.appendChild(listItem);
      });

      addItemButton.addEventListener('click', () => {
         const itemInput = this.view.getElementsByTagName('input')[0];
         const item = itemInput.value.trim();
         if (item !== '') {
            itemInput.value = '';
            shoppingList.items.push(item);

            shoppingList.save()
               .then(() =>
                  list.appendChild(createShoppingListListItem(
                     templateEngine,
                     shoppingList,
                     item
                  ))
               )
               .catch(err => {
                  throw err;
               });
         }
      });

      clearShoppingListButton.addEventListener('click', () => {
         shoppingList.items = [];
         shoppingList.save()
            .then(() => list.textContent = '')
            .catch(err => {
               throw err
            });
      });
   }
}
