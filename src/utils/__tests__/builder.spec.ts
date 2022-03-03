import { documentBuilder } from '../builder';

describe('Builder', () => {
  describe('documentBuilder', () => {
    const searchQuery = 'test';
    const sources = ['source1', 'source2'];
    const fileTypes = ['PDF', 'Document'];
    const documentTypes = ['unknown', 'label1', 'label2'];

    it('returns the base object on zero arity', () => {
      const result = documentBuilder();

      expect(result).toMatchObject({});
    });

    it('returns the search object', () => {
      const result = documentBuilder({ searchQuery });

      expect(result).toMatchObject({
        search: {
          query: searchQuery,
        },
      });
    });

    it('returns the search + source object', () => {
      const result = documentBuilder({ searchQuery, sources });

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

    it('returns the search + source + filetypes object', () => {
      const result = documentBuilder({
        searchQuery,
        sources,
        fileTypes,
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
          type: {
            in: fileTypes,
          },
        },
      });
    });

    it('returns the search + source + filetype + document type object', () => {
      const result = documentBuilder({
        searchQuery,
        sources,
        fileTypes,
        documentTypes,
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
