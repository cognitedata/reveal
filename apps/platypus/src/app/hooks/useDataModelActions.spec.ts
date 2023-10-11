import {
  DataModelVersion,
  DataModelVersionStatus,
} from '@platypus/platypus-core';

import { useDataModel, useDataModelVersions } from './useDataModelActions';
import { useSelectedDataModelVersion } from './useSelectedDataModelVersion';

jest.mock('./useDataModelActions');

/*
These are cast to jest.Mock<unknown> because otherwise our mock implementations would
have to match the return type of useQuery which is 20 or so properties.

TODO figure out a better solution
*/
const mockedUseDataModelVersions = useDataModelVersions as jest.Mock<unknown>;
const mockedUseDataModel = useDataModel as jest.Mock<unknown>;

mockedUseDataModel.mockReturnValue({
  data: {
    createdTime: 123,
    description: 'desc',
    id: 'extId',
    name: 'name',
    owners: [],
    space: '3',
    updatedTime: 123,
    version: '3',
  },
});

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
      mockedUseDataModelVersions.mockReturnValue({
        data: [
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
        ],
      });

      const selectedDataModelVersion = useSelectedDataModelVersion(
        'latest',
        '',
        '4'
      ).dataModelVersion;

      expect(selectedDataModelVersion.version).toBe('3');
      expect(selectedDataModelVersion.description).toBe('d4');
    });

    it('returns a default if there are no published versions', () => {
      mockedUseDataModelVersions.mockReturnValue({
        data: [],
      });

      const selectedDataModelVersion = useSelectedDataModelVersion(
        'latest',
        '',
        '1'
      ).dataModelVersion;

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

      mockedUseDataModelVersions.mockReturnValue({
        data: versions,
      });

      const selectedDataModelVersion = useSelectedDataModelVersion(
        '2',
        '',
        '2'
      ).dataModelVersion;

      expect(selectedDataModelVersion.version).toBe('2');
    });
  });
});
