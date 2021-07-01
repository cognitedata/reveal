import { sourceProjects } from '__fixtures__/fixtureProjects';

import { getRepositoryIdInArrayFromExternalId } from '../utils';

describe('utils', () => {
  describe('getRepositoryIdInArrayFromExternalId', () => {
    it('finds the id with the external id', () => {
      const result = getRepositoryIdInArrayFromExternalId(
        sourceProjects,
        'SourceTestProject'
      );

      expect(result).toBe(143);
    });

    it('returns null if the external id is not present in the source projects', () => {
      const result = getRepositoryIdInArrayFromExternalId(
        sourceProjects,
        'somerandom'
      );

      expect(result).toBeNull();
    });
  });
});
