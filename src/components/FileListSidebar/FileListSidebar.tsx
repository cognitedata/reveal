import { Body, Button, Title } from '@cognite/cogs.js';
import { FileSidebar } from 'components/LinkedAssetsSidebar/elements/FileSidebar';
import { Header } from 'components/LinkedAssetsSidebar/elements/Header';
import { ComponentProps, MouseEventHandler } from 'react';
import { FileList } from './FileList';

type Props = {
  onClose: MouseEventHandler<HTMLButtonElement>;
  onFileClick: ComponentProps<typeof FileList>['onFileClick'];
  asset: {
    name: string;
    description: string;
  };
  files: {
    list: ComponentProps<typeof FileList>['files'];
    isLoading: boolean;
    isError: boolean;
  };
  closeButtonText: string;
};

const FileListSidebar = ({
  onClose,
  closeButtonText = 'Back to chart',
  asset,
  files,
  onFileClick,
}: Props) => {
  return (
    <FileSidebar>
      <Header>
        <Button icon="ArrowLeft" style={{ marginBottom: 20 }} onClick={onClose}>
          {closeButtonText}
        </Button>
        <Title level={4}>{asset.name}</Title>
        <Body level={2}>{asset.description}</Body>
      </Header>
      <FileList
        files={files.list}
        onFileClick={onFileClick}
        isLoading={files.isLoading}
        isError={files.isError}
      />
    </FileSidebar>
  );
};

export default FileListSidebar;
