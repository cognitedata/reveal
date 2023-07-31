import { formatFacetValue } from 'domain/documents/utils/formatFacetValue';

describe('documents:utils', () => {
  describe('Facet: Date', () => {
    it('Formats the date facet correctly', () => {
      const result = formatFacetValue(
        'lastcreated',
        ['1646342052936', '1646342052936'],
        {}
      );

      expect(result).toMatch('Created: 03-Mar-2022-03-Mar-2022');
    });

    it('Removes the prefix on date format', () => {
      const result = formatFacetValue(
        'lastcreated',
        ['1646342052936', '1646342052936'],
        {},
        true
      );

      expect(result).toMatch('03-Mar-2022-03-Mar-2022');
    });

    it('Throws error on invalid date format', () => {
      expect(() =>
        formatFacetValue('lastcreated', ['1646342052936'], {})
      ).toThrow();
    });
  });

  describe('Facet: Page count', () => {
    it('Formats page counts correctly', () => {
      const result = formatFacetValue('pageCount', ['0', '100'], {});

      expect(result).toMatch('Page Count: 0 - 10');
    });

    it('Throws error on invalid page count values', () => {
      expect(() => formatFacetValue('pageCount', ['0'], {})).toThrow();
    });

    it('Hides the prefix of page count', () => {
      const result = formatFacetValue('pageCount', ['0', '100'], {});

      expect(result).toMatch('0 - 10');
    });
  });

  describe('Facet: Labels', () => {
    it('Formats the labels correctly', () => {
      const result = formatFacetValue('labels', { externalId: 'test' }, {});

      expect(result).toMatch('Document Category: test');
    });

    it('Formats with correctly with external labels', () => {
      const result = formatFacetValue(
        'labels',
        { externalId: 'test' },
        { test: 'Cool Test' }
      );

      expect(result).toMatch('Document Category: Cool Test');
    });

    it('Hides the prefix of labels correctly', () => {
      const result = formatFacetValue(
        'labels',
        { externalId: 'test' },
        {},
        true
      );

      expect(result).toMatch('test');
    });

    it('Fails on array as item', () => {
      expect(() => formatFacetValue('labels', [], {})).toThrow();
    });
  });

  describe('Facet: "rest"', () => {
    it('Formats the file type correctly', () => {
      const result = formatFacetValue('fileCategory', 'pdf', {});

      expect(result).toMatch('File Type: pdf');
    });

    it('Hides the prefix on file type', () => {
      const result = formatFacetValue('fileCategory', 'pdf', {}, true);

      expect(result).toMatch('pdf');
    });

    it('Manges to show array as items', () => {
      const result = formatFacetValue('fileCategory', ['pdf', 'image'], {});

      expect(result).toMatch('File Type: pdf,image');
    });

    it('Manages to show number as items', () => {
      const result = formatFacetValue('fileCategory', 10, {});

      expect(result).toMatch('File Type: 10');
    });
  });
});
