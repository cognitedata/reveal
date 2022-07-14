import { TranslationKeys } from 'common/i18n';
import { Artifact } from './ExtractorDownloadApi';

export const getColumns = (_t: (key: TranslationKeys) => string) => {
  const extractorColumns = [
    {
      title: _t('name'),
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: _t('description'),
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const versionTableColumns = [
    {
      title: _t('version'),
      dataIndex: 'version',
      key: 'version',
      width: 110,
    },
    {
      title: _t('release-date'),
      dataIndex: 'releasedAt',
      key: 'releasedAt',
      width: 140,
    },
    {
      title: _t('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: _t('download-links'),
      dataIndex: 'downloads',
      key: 'downloads',
      width: 280,
    },
  ];

  return {
    extractorColumns,
    versionTableColumns,
  };
};

export const getArtifactName = (artifact: Artifact): string => {
  return artifact.displayName ?? artifact.name;
};
