import { getPipelineIdFromPath, stringContains } from './utils';

describe('Utils test', () => {
  describe('getPipelineIdFromPath', () => {
    it('returns false when there is no id', () => {
      const noPipelineIdPath = 'https://dev.fusion.cogniteapp.com/';
      expect(getPipelineIdFromPath(noPipelineIdPath)).toEqual(false);
    });
    it('returns the right id when its there', () => {
      const pathWithId =
        'https://dev.fusion.cogniteapp.com/some-tenant/entity_matching/pipeline/43232';
      expect(getPipelineIdFromPath(pathWithId)).toEqual('43232');
    });
    it('return false when the id is invalid', () => {
      const invalidId =
        'https://dev.fusion.cogniteapp.com/some-tenant/entity_matching/pipeline/23hello2321';
      expect(getPipelineIdFromPath(invalidId)).toEqual(false);
    });
  });
  describe('stringContains', () => {
    it('returns true when value contains query', () => {
      const value = 'hello';
      const query = 'llo';

      expect(stringContains(value, query)).toEqual(true);
    });
    it('returns false when value does not contain query', () => {
      const value = 'hello';
      const query = 'meoww';

      expect(stringContains(value, query)).toEqual(false);
    });
    it('returns error when it is invalid', () => {
      const value = 'hello';
      const query = '\\';

      expect(stringContains(value, query)).toEqual('Invalid search term');
    });
  });
});
