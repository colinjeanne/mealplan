const createListItemFromIdea = (templateEngine, ideas, idea) => {
   const listItem = templateEngine.create('ideaListItem');
   const description = listItem.getElementsByClassName('idea')[0];
   description.textContent = idea.description;

   const source = listItem.getElementsByClassName('ideaSource')[0];
   source.textContent = idea.source;

   const removeButton = listItem.getElementsByTagName('button')[0];
   removeButton.addEventListener('click', () => {
      const index = ideas.items.find(
         foundIdea => foundIdea.description === idea.description);
      removeButton.disabled = true;

      ideas.items.splice(index, 1);
      ideas.save()
         .then(() => listItem.parentNode.removeChild(listItem))
         .catch(err => {
            removeButton.disabled = false;
            throw err;
         });
   });

   return listItem;
};

const createDisplayView = (templateEngine, title, ideas, filter) => {
   const view = templateEngine.create('displayIdeas');
   const header = view.getElementsByTagName('header')[0];
   header.textContent = title;

   const list = view.getElementsByTagName('ul')[0];
   ideas.items
      .filter(filter)
      .forEach(idea => {
         const listItem = createListItemFromIdea(templateEngine, ideas, idea);
         list.appendChild(listItem);
      });

   return view;
};

const randomString = (length) => {
   let possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   let s = '';
   for (let i = 0; i < length; ++i) {
      s += possibleCharacters.charAt(
         Math.floor(Math.random() * possibleCharacters.length));
   }

   return s;
};

const createAddIdeaView = (templateEngine, mealPlanApi, ideas) => {
   const view = templateEngine.create('addIdea');
   const description = view.getElementsByTagName('textarea')[0];
   const source = view.getElementsByTagName('input')[0];
   const datalist = view.getElementsByTagName('datalist')[0];
   const addIdeaButton = view.getElementsByTagName('button')[0];

   datalist.id = randomString(5);
   source.setAttribute('list', datalist.id);

   ideas.items.forEach(idea => {
      const option = datalist.ownerDocument.createElement('option');
      option.value = idea.description;
      datalist.appendChild(option);
   });

   addIdeaButton.addEventListener('click', () => {
      const descriptionValue = description.value.trim();
      const sourceValue = source.value.trim();

      addIdeaButton.disabled = true;

      let idea;
      if (sourceValue !== '') {
         idea = new mealPlanApi.Idea(descriptionValue, sourceValue);
      } else {
         idea = new mealPlanApi.Idea(descriptionValue);
      }

      ideas.items.push(idea);
      ideas.save()
         .then(() => {
            addIdeaButton.disabled = false;
            description.value = '';
            source.value = '';
         })
         .catch(err => {
            addIdeaButton.disabled = false;
            throw err;
         });
   });
   return view;
};

const fisherYatesShuffle = arr => {
   for (let i = arr.length - 1; i > 0; --i) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
   }

   return arr;
};

const choose = (arr, count) => arr.slice(0, count);

const randomFilter = ideas => {
   const indices = ideas.items.map((idea, index) => index);
   const randomIndices = choose(fisherYatesShuffle(indices), 5);
   return (idea, index) => randomIndices.indexOf(index) !== -1;
};

const templateEngineSymbol = Symbol('templateEngine');

export default class {
   constructor(templateEngine, mealPlanApi, ideas, viewType) {
      this[templateEngineSymbol] = templateEngine;

      switch (viewType) {
         case 'random':
         this.view = createDisplayView(
            this[templateEngineSymbol],
            'Some Random Ideas',
            ideas,
            randomFilter(ideas));
         break;

         case 'all':
         this.view = createDisplayView(
            this[templateEngineSymbol],
            'All of My Ideas',
            ideas,
            () => true);
         break;

         case 'addIdea':
         this.view = createAddIdeaView(
            templateEngine,
            mealPlanApi,
            ideas);
         break;

         default:
         throw new Error(`Unknown view type: ${viewType}`);
      }
   }
}
