import { extractUniqueIds, getIdParam, pickOptionalId } from '../id';

describe('IdUtils', () => {
  describe('pickOptionalId', () => {
    it('should return undefined when no parameter provided', () => {
      const result = pickOptionalId();
      expect(result).toBeUndefined();
    });

    it('should return externalId when both id and externalId exists', () => {
      const result = pickOptionalId({ externalId: 'externalId', id: 1 });
      expect(result).toBe('externalId');
    });

    it('should return id when both only id exists', () => {
      const result = pickOptionalId({ id: 1 });
      expect(result).toBe(1);
    });
  });

  describe('extractUniqueIds', () => {
    it('should return a unique list of ids and externalIds', () => {
      const ids = [
        { id: 1 },
        { id: 1 },
        { id: 1 },
        { id: 2 },
        { externalId: '1' },
        { externalId: '1' },
        { externalId: 'someExternalId' },
        { externalId: 'someOtherExternalId' },
      ];
      const result = extractUniqueIds(ids);
      expect(result).toEqual({
        uniqueIds: [{ id: 1 }, { id: 2 }],
        uniqueExternalIds: [
          { externalId: '1' },
          { externalId: 'someExternalId' },
          { externalId: 'someOtherExternalId' },
        ],
      });
    });
  });

  describe('getIdParam', () => {
    it('should return externalId if parameter is string', () => {
      const result = getIdParam('someId');
      expect(result).toEqual({ externalId: 'someId' });
    });

    it('should return id if parameter is number', () => {
      const result = getIdParam(1);
      expect(result).toEqual({ id: 1 });
    });
  });
});
