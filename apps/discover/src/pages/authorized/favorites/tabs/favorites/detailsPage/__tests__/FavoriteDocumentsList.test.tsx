import { shouldShowLoadMoreButton } from '../FavoriteDocumentsList';

describe('FavoriteDocumentsList', () => {
  describe('shouldShowLoadMoreButton', () => {
    it('should be ok in empty case', () => {
      expect(
        shouldShowLoadMoreButton({
          isDocumentsLoading: false,
          isDocumentsIdle: false,
          documentIds: [],
          loadedDocuments: [],
        })
      ).toEqual(false);
    });
  });
});
