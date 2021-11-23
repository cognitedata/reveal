import { Project } from 'typings/interfaces';
import { sourceProjects } from '__fixtures__/fixtureProjects';

import { getRepositoryIdInArrayFromExternalId } from '../utils';

describe('utils', () => {
  describe('getRepositoryIdInArrayFromExternalId', () => {
    const validProject: Project = {
      external_id: 'SourceTestProject',
      instance: 'sourceTest',
      source: 'Studio',
    };
    const invalidProject: Project = {
      external_id: 'Invalid',
      instance: 'PSC_test',
      source: 'Studio',
    };

    it('finds the id with the external id', () => {
      const result = getRepositoryIdInArrayFromExternalId(
        sourceProjects,
        validProject
      );

      expect(result).toBe(143);
    });

    it('returns null if the external id is not present in the source projects', () => {
      const result = getRepositoryIdInArrayFromExternalId(
        sourceProjects,
        invalidProject
      );

      expect(result).toBeNull();
    });
  });
});
