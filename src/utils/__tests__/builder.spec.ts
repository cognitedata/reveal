import { documentBuilder } from '../builder';

describe('Builder', () => {
  describe('documentBuilder', () => {
    const searchQuery = 'test';
    const sources = ['source1', 'source2'];
    const fileTypes = ['PDF', 'Document'];
    const labels = ['unknown', 'label1', 'label2'];

    it('returns the base object on zero arity', () => {
      const result = documentBuilder({
        showDocumentsLabeledInFiles: true,
      });

      expect(result).toMatchObject({});
    });

    it('returns the search object', () => {
      const result = documentBuilder({
        searchQuery,
        showDocumentsLabeledInFiles: true,
      });

      expect(result).toMatchObject({
        search: {
          query: searchQuery,
        },
      });
    });

    it('returns the search + source object', () => {
      const result = documentBuilder({
        searchQuery,
        sources,
        showDocumentsLabeledInFiles: true,
      });

      expect(result).toMatchObject({
        search: {
          query: searchQuery,
        },
        filter: {
          sourceFile: {
            source: {
              in: sources,
            },
          },
        },
      });
    });

    it('returns the search + filter out labeled files', () => {
      const result = documentBuilder({
        searchQuery,
        showDocumentsLabeledInFiles: false,
      });

      expect(result).toMatchObject({
        search: {
          query: searchQuery,
        },
        filter: {
          sourceFile: {
            labels: {
              missing: true,
            },
          },
        },
      });
    });

    it('returns the search + source + filetypes object + filter out labeled files', () => {
      const result = documentBuilder({
        searchQuery,
        sources,
        fileTypes,
        showDocumentsLabeledInFiles: false,
      });

      expect(result).toMatchObject({
        search: {
          query: searchQuery,
        },
        filter: {
          sourceFile: {
            source: {
              in: sources,
            },
            labels: {
              missing: true,
            },
          },
          type: {
            in: fileTypes,
          },
        },
      });
    });

    it('returns the search + source + filetype + document type object + filter out labeled files', () => {
      const result = documentBuilder({
        searchQuery,
        sources,
        fileTypes,
        labels,
        showDocumentsLabeledInFiles: false,
      });

      expect(result).toMatchObject({
        search: {
          query: searchQuery,
        },
        filter: {
          sourceFile: {
            labels: {
              missing: true,
            },
            source: {
              in: sources,
            },
          },
          type: {
            in: fileTypes,
          },
          labels: {
            containsAny: [
              { externalId: 'unknown' },
              { externalId: 'label1' },
              { externalId: 'label2' },
            ],
          },
        },
      });
    });
  });
});
