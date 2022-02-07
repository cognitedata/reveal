import { FileInfo } from '@cognite/sdk';
import Loading from 'components/utils/Loading';
import useFilesListQuery from 'hooks/useQuery/useFilesListQuery';
import StatusMessage from 'components/utils/StatusMessage';
import { Button } from '@cognite/cogs.js';

import Card from '../Card';

import { FileLink } from './elements';

export type DocumentsCardProps = {
  assetId: number;
  onHeaderClick?: () => void;
  descriptionField?: string;
  onFileClick?: (file: FileInfo) => void;
};

const DocumentsCard = ({
  assetId,
  onHeaderClick,
  onFileClick,
  descriptionField,
}: DocumentsCardProps) => {
  const {
    data: fileList,
    isLoading,
    error,
  } = useFilesListQuery({
    filter: { assetIds: [assetId] },
    limit: 5,
  });

  const renderLink = (file: FileInfo) => {
    return (
      <FileLink>
        <Button type="link" onClick={() => onFileClick && onFileClick(file)}>
          {file.name}
        </Button>
        {descriptionField && <span>{file.metadata?.[descriptionField]}</span>}
      </FileLink>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }
    if (error) {
      return (
        <StatusMessage
          type="Error"
          message="We could not load your documents."
        />
      );
    }
    return fileList?.map(renderLink);
  };

  return (
    <Card
      header={{ title: 'Documents', icon: 'Document' }}
      onClick={onHeaderClick}
    >
      {renderContent()}
    </Card>
  );
};

export default DocumentsCard;
