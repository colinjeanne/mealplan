export default class {
   constructor(container, existingTabs = []) {
      this.container = container;
      this.tabs = existingTabs;

      const raiseEvent = tab => {
         const knownTab = this.tabs.find(knownTab => knownTab.tab === tab);
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

   toggled() {
      const toggledTab = this.container.querySelector('input:checked');
      if (toggledTab) {
         return toggledTab.id;
      }

      return null;
   }

   register() {
      const knownTab = this.tabs.find(knownTab => knownTab.tab === tab);

      if (!knownTab) {
         this.tabs.push({tab, handler});
      }
   }
}
