const findTabSymbol = Symbol('findTab');

export default class {
   constructor(container, existingTabs = []) {
      this.container = container;
      this.tabs = existingTabs;

      const raiseEvent = tab => {
         const knownTab = this[findTabSymbol](tab);
         if (knownTab) {
            knownTab.handler.call();
         }
      };

      this.container.addEventListener(
         'change',
         event => raiseEvent(event.target.id));

      // Raise the event for the currently selected tab
      raiseEvent(this.toggled());
   }

   [findTabSymbol](tab) {
      return this.tabs.find(knownTab => knownTab.tab === tab);
   }

   toggled() {
      const toggledTab = this.container.querySelector('input:checked');
      if (toggledTab) {
         return toggledTab.id;
      }

      return null;
   }

   register() {
      const knownTab = this[findTabSymbol](tab);

      if (!knownTab) {
         this.tabs.push({tab, handler});
      }
   }

   add(templateEngine, tab) {
      if (this[findTabSymbol](tab.tab)) {
         throw new Error('Tab already exists');
      }

      const knownTab = {
         tab: tab.id,
         handler: tab.handler
      };

      this.tabs.push(knownTab);

      const tabItem = templateEngine.create('mainNavigationTab');
      const tabButton = tabItem.getElementsByTagName('input')[0];
      tabButton.id = tab.id;

      const tabLabel = tabItem.getElementsByTagName('label')[0];
      tabLabel.htmlFor = tab.id;
      tabLabel.textContent = tab.title;

      const tabList = this.container.getElementsByTagName('ul')[0];
      tabList.appendChild(tabItem);
   }

   remove(tab) {
      const index = this.tabs.findIndex(knownTab => knownTab.tab === tab);
      if (index !== -1) {
         this.tabs.splice(index, 1);
      }

      const tabItem = this.container.getElementById(tab);
      if (tabItem) {
         const tabList = this.container.getElementsByTagName('ul')[0];
         tabList.removeChild(tabItem);
      }
   }
}
