const isMobile = toggleElement => toggleElement.style.display !== 'none';

export default class {
   constructor(toggleElement) {
      this.toggleElement = toggleElement;
      this.menus = [];

      this.toggleElement.addEventListener(
         'click',
         () => this.toggleMenus());
   }

   toggle() {
      this.menus.forEach(menuElement =>
         menuElement.classList.toggle('hiddenMenu'));
   }

   hide() {
      if (isMobile(this.toggleElement)) {
         this.menus.forEach(menuElement =>
            menuElement.classList.add('hiddenMenu'));
      }
   }

   register(menuElement) {
      this.menus.push(menuElement);
   }
}
