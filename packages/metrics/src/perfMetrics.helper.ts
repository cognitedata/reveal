import {
  MutationSearchProps,
  MutationSearchResults,
  mutationType,
} from 'types';

/**
 * Used along with observeDOM, acts as a helper to find your desired mutations
 *
 * Example arguments specified below would match the following node if it was added or removed
 * <div data-testid="table-row"></div>
 *
 * @param {MutationRecord[]} mutations : an array of mutations found on the DOM by the DOM observer
 * @param {MutationSearchProps} searchProps : an object which contains the mutation search parameters
 * @param {string} searchProps.type :
 * @param {mutationType[]} searchProps.searchIn : For example ['addedNodes', 'removedNodes']
 * @param {string} searchProps.searchBy : For example: attribute
 * @param {string} searchProps.searchFor : For example: data-testid
 * @param {string} searchProps.searchValue : Value of the specified "SearchFor", E.g table-row
 * @param {(results: MutationSearchResults) => void} searchProps.callback : A callback that fires with the results of the search in the mutation array
 * */
export function findInMutation({
  mutations,
  searchFor,
  type,
  searchIn,
  searchBy,
  searchValue,
  callback,
}: MutationSearchProps) {
  try {
    const filterCondition = (() => {
      if (
        searchIn.includes('addedNodes') &&
        searchIn.includes('removedNodes')
      ) {
        return (mutation: MutationSearchResults) => {
          return mutation.addedNodes || mutation.removedNodes;
        };
      }
      if (searchIn.includes('addedNodes')) {
        return (mutation: MutationSearchResults) => {
          return mutation.addedNodes;
        };
      }
      if (searchIn.includes('removedNodes')) {
        return (mutation: MutationSearchResults) => {
          return mutation.removedNodes;
        };
      }
      return (_mutation: MutationSearchResults) => true;
    })();

    const getFirst = (mutation: MutationRecord, type: mutationType) => {
      const item =
        mutation[type].length > 0
          ? (mutation[type].item(0) as HTMLElement)
          : undefined;
      return item;
    };

    mutations
      .filter((mutation: MutationRecord) => {
        return (
          mutation.type === type &&
          filterCondition({
            addedNodes: mutation.addedNodes.length > 0,
            removedNodes: mutation.removedNodes.length > 0,
          })
        );
      })
      .forEach((mutation: MutationRecord) => {
        const output: MutationSearchResults =
          searchIn.reduce<MutationSearchResults>(
            (
              searchResults: MutationSearchResults,
              mutationType: mutationType
            ) => {
              const item = getFirst(mutation, mutationType);
              if (item) {
                switch (searchFor) {
                  case 'attribute':
                    return {
                      ...searchResults,
                      [mutationType]: item
                        .getAttribute(searchBy)
                        ?.toLocaleLowerCase()
                        .includes(searchValue),
                    } as MutationSearchResults;
                  default:
                    return searchResults;
                }
              }
              return searchResults;
            },
            { addedNodes: false, removedNodes: false }
          );
        callback(output);
      });
  } catch (_error) {
    callback({ addedNodes: false, removedNodes: false });
  }
}
