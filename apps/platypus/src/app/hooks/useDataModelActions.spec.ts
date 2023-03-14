import {
  DataModelVersion,
  DataModelVersionStatus,
} from '@platypus/platypus-core';
import { useSelectedDataModelVersion } from './useDataModelActions';
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      createdTime: 123,
      lastUpdatedTime: 123,
      externalId: 'extId',
      name: 'name',
      description: 'desc',
      schema: '',
      status: 'published',
      version: '3',
      space: '3',
    },
  }),
}));
jest.mock('./useInjection', () => {
  return {
    useInjection: () => {
      return {
        fetch: jest.fn(),
      };
    },
  };
});

describe('useDataModelActions', () => {
  describe('useSelectedDataModelVersion', () => {
    it('returns latest version', () => {
      const versions: DataModelVersion[] = [
        {
          createdTime: 123,
          lastUpdatedTime: 123,
          externalId: '',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          version: '3',
          space: '3',
          description: 'd4',
        },
        {
          createdTime: 123,
          lastUpdatedTime: 123,
          externalId: '',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          version: '2',
          space: '2',
        },
        {
          createdTime: 123,
          lastUpdatedTime: 123,
          externalId: '',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          version: '4',
          space: '4',
        },
      ];

      const selectedDataModelVersion = useSelectedDataModelVersion(
        'latest',
        versions,
        '',
        '4'
      );

      expect(selectedDataModelVersion.version).toBe('3');
      expect(selectedDataModelVersion.description).toBe('d4');
    });

    it('returns a default if there are no published versions', () => {
      const selectedDataModelVersion = useSelectedDataModelVersion(
        'latest',
        [],
        '',
        '1'
      );

      expect(selectedDataModelVersion).toMatchObject(
        expect.objectContaining({
          status: DataModelVersionStatus.DRAFT,
          version: '1',
          description: 'desc',
        })
      );
    });

    it('returns the matching version number', () => {
      const versions: DataModelVersion[] = [
        {
          createdTime: 123,
          lastUpdatedTime: 123,
          externalId: '',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          version: '3',
          space: '3',
        },
        {
          createdTime: 123,
          lastUpdatedTime: 123,
          externalId: '',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          version: '2',
          space: '2',
        },
        {
          createdTime: 123,
          lastUpdatedTime: 123,
          externalId: '',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          version: '4',
          space: '4',
        },
      ];

      const selectedDataModelVersion = useSelectedDataModelVersion(
        '2',
        versions,
        '',
        '2'
      );

      expect(selectedDataModelVersion.version).toBe('2');
    });
  });
});
