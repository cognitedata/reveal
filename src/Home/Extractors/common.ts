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

export const getArtifactPlatform = (
  _t: (key: TranslationKeys) => string,
  artifact: Artifact
): string => {
  switch (artifact.platform) {
    case 'docs':
      return _t('documentation');
    case 'windows':
      return _t('windows');
    case 'linux':
      return _t('linux');
    case 'macos':
      return _t('macos');
  }
  return '';
};

export const getArtifactType = (artifact: Artifact): string => {
  const name = artifact.name.toLowerCase();
  if (name.endsWith('zip') || name.endsWith('gz') || name.endsWith('tar')) {
    return 'zip';
  } else if (name.endsWith('pdf')) {
    return 'pdf';
  } else if (
    name.endsWith('msi') ||
    name.endsWith('rpm') ||
    name.endsWith('deb')
  ) {
    return 'installer';
  } else {
    return 'executable';
  }
};

export const getArtifactName = (
  _t: (key: TranslationKeys) => string,
  artifact: Artifact
): string => {
  return `${getArtifactPlatform(_t, artifact)} ${getArtifactType(artifact)}`;
};
