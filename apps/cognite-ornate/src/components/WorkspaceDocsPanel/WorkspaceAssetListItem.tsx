import { useState } from 'react';
import { AllIconTypes, Icon } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { Asset, FileInfo } from '@cognite/sdk';
import { ListItem } from 'components/List';
import { useTranslation } from 'hooks/useTranslation';
import useConfig from 'hooks/useConfig';

import { ListItemFiles } from './elements';

type WorkSpaceAssetListItemProps = {
  asset: Asset;
  onClickFile: (file: FileInfo) => void;
};

export const WorkSpaceAssetListItem = ({
  asset,
  onClickFile,
}: WorkSpaceAssetListItemProps) => {
  const { client } = useAuthContext();
  const { t } = useTranslation('workspace-asset-list-item');
  const config = useConfig(client?.project);

  const [expanded, setExpanded] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [relevantFiles, setRelevantFiles] = useState<FileInfo[]>();
  const onExpand = async () => {
    if (expanded) {
      setExpanded(false);
    }
    if (relevantFiles) {
      setExpanded(true);
      return;
    }
    setExpanding(true);

    const files = await client?.files
      .list({
        filter: {
          ...config.fileFilter,
          assetIds: [asset.id],
        },
      })
      .then((res) => res.items);
    setRelevantFiles(files);
    setExpanded(true);
    setExpanding(false);
  };

  const renderFiles = () => {
    if (!expanded) {
      return null;
    }
    if (relevantFiles?.length === 0) {
      return (
        <div>{t('no_files_under_tag', 'No files found under this tag')}</div>
      );
    }
    return relevantFiles?.map((file) => (
      <ListItem
        className="indent"
        key={file.id}
        onClick={() => {
          onClickFile(file);
        }}
      >
        {file.name}
      </ListItem>
    ));
  };

  const getIconType = (): AllIconTypes => {
    if (expanding) {
      return 'Loader';
    }
    if (expanded) {
      return 'ChevronRight';
    }
    return 'ChevronDown';
  };

  return (
    <div>
      <ListItem onClick={onExpand}>
        {asset.name} <Icon className="right-icon" type={getIconType()} />
      </ListItem>
      <ListItemFiles>{renderFiles()}</ListItemFiles>
    </div>
  );
};
