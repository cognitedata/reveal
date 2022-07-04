import { Asset } from '@cognite/sdk';
import FileListSidebar from 'components/FileListSidebar/FileListSidebar';
import { useComponentTranslations } from 'hooks/translations';
import useFileListSidebar from 'models/charts/file-list-sidebar/hooks/useFileListSidebar';
import { ComponentProps, useEffect } from 'react';

type Props = {
  asset: Asset;
  selectedFileId?: number;
  onFileClick: ComponentProps<typeof FileListSidebar>['onFileClick'];
};

const ConnectedFileListSidebar = ({
  asset,
  selectedFileId,
  onFileClick,
}: Props) => {
  const files = useFileListSidebar(asset, selectedFileId ?? NaN);

  useEffect(() => {
    if (files.list.length > 0 && !selectedFileId) onFileClick(files.list[0].id);
  }, [files.list, onFileClick, selectedFileId]);

  return (
    <FileListSidebar
      asset={{ name: asset.name, description: asset.description }}
      translations={useComponentTranslations(FileListSidebar)}
      onFileClick={onFileClick}
      files={files}
    />
  );
};

export default ConnectedFileListSidebar;
