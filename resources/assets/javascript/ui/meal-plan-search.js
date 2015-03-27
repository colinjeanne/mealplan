const searchInputSymbol = Symbol('searchInput');

export default class {
   constructor(searchInput, dataSource, resultsHandler) {
      this.dataSource = dataSource;
      this.resultsHandler = resultsHandler;
      this[searchInputSymbol] = searchInput;

      const inputHandler = event => {
         const searchTerm = event.target.value.trim();
         const searchOptions = {
               title: searchTerm,
               tag: searchTerm
            };

         this.dataSource(searchOptions).then(this.resultsHandler);
      };

      searchInput.addEventListener('input', inputHandler);
   }

   clear() {
      this[searchInputSymbol].value = '';
   }
}
