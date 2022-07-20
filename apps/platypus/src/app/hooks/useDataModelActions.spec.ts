import {
  DataModelVersion,
  DataModelVersionStatus,
} from '@platypus/platypus-core';
import { useSelectedDataModelVersion } from './useDataModelActions';

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
        },
        {
          createdTime: 123,
          lastUpdatedTime: 123,
          externalId: '',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          version: '2',
        },
        {
          createdTime: 123,
          lastUpdatedTime: 123,
          externalId: '',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          version: '4',
        },
      ];

      const selectedDataModelVersion = useSelectedDataModelVersion(
        'latest',
        versions,
        ''
      );

      expect(selectedDataModelVersion.version).toBe('4');
    });

    it('returns a default if there are no published versions', () => {
      const selectedDataModelVersion = useSelectedDataModelVersion(
        'latest',
        [],
        ''
      );

      expect(selectedDataModelVersion).toMatchObject(
        expect.objectContaining({
          status: DataModelVersionStatus.DRAFT,
          version: '1',
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
        },
        {
          createdTime: 123,
          lastUpdatedTime: 123,
          externalId: '',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          version: '2',
        },
        {
          createdTime: 123,
          lastUpdatedTime: 123,
          externalId: '',
          schema: '',
          status: DataModelVersionStatus.PUBLISHED,
          version: '4',
        },
      ];

      const selectedDataModelVersion = useSelectedDataModelVersion(
        '2',
        versions,
        ''
      );

      expect(selectedDataModelVersion.version).toBe('2');
    });
  });
});
