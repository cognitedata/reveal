import { Body, Title } from '@cognite/cogs.js';
import { FileSidebar } from 'components/LinkedAssetsSidebar/elements/FileSidebar';
import { Header } from 'components/LinkedAssetsSidebar/elements/Header';
import { ComponentProps } from 'react';
import { FileList } from './FileList';

type Props = {
  onFileClick: ComponentProps<typeof FileList>['onFileClick'];
  asset: {
    name: string;
    description: string | undefined;
  };
  files: {
    list: ComponentProps<typeof FileList>['files'];
    isLoading: boolean;
    isError: boolean;
  };
  translations?: ComponentProps<typeof FileList>['translations'];
};

const FileListSidebar = ({
  asset,
  files,
  onFileClick,
  translations,
}: Props) => {
  return (
    <FileSidebar>
      <Header>
        <Title level={4}>{asset.name}</Title>
        {asset.description && <Body level={2}>{asset.description}</Body>}
      </Header>
      <FileList
        files={files.list}
        onFileClick={onFileClick}
        isLoading={files.isLoading}
        isError={files.isError}
        translations={translations}
      />
    </FileSidebar>
  );
};

FileListSidebar.defaultTranslations = FileList.defaultTranslations;
FileListSidebar.translationNamespace = FileList.translationNamespace;
FileListSidebar.translationKeys = FileList.translationKeys;

export default FileListSidebar;
