import { useParams } from 'react-router-dom';

import { PageTitle } from '@cognite/cdf-utilities';
import { FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { FilePreview } from './FilePreview';

export const FilePage = () => {
  const { id } = useParams<{
    id: string | undefined;
  }>();
  const fileId = id ? parseInt(id, 10) : undefined;
  const invalidId = !fileId || Number.isNaN(fileId);

  const { data: fileInfo } = useCdfItem<FileInfo>('files', {
    id: fileId!,
  });

  if (invalidId) {
    return null;
  }

  return (
    <>
      <PageTitle title={fileInfo?.name} />
      <FilePreview fileId={fileId!} />
    </>
  );
};
