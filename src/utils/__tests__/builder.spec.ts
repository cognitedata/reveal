import { documentBuilder } from '../builder';

describe('Builder', () => {
  describe('documentBuilder', () => {
    const searchQuery = 'test';
    const source = 'source';
    const fileType = 'pdf';
    const documentType = 'unknown';

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
      const result = documentBuilder({ searchQuery, source });

      expect(result).toMatchObject({
        search: {
          query: searchQuery,
        },
        filter: {
          sourceFile: {
            source: {
              in: [source],
            },
          },
        },
      });
    });

    it('returns the search + source + filetype object', () => {
      const result = documentBuilder({
        searchQuery,
        source,
        fileType,
      });

      expect(result).toMatchObject({
        search: {
          query: searchQuery,
        },
        filter: {
          sourceFile: {
            source: {
              in: [source],
            },
          },
          type: {
            in: [fileType],
          },
        },
      });
    });

    it('returns the search + source + filetype + document type object', () => {
      const result = documentBuilder({
        searchQuery,
        source,
        fileType,
        documentType,
      });

      expect(result).toMatchObject({
        search: {
          query: searchQuery,
        },
        filter: {
          sourceFile: {
            source: {
              in: [source],
            },
          },
          type: {
            in: [fileType],
          },
          labels: {
            containsAny: [{ externalId: documentType }],
          },
        },
      });
    });
  });
});
