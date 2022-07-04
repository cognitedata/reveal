import { DocumentIcon, Icon } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { isFilePreviewable } from 'models/cdf/files/utils/isFilePreviewable';
import { UseQueryResult } from 'react-query';

export default function filePreviewSelector(
  filePreviewQuery: UseQueryResult<string | undefined, unknown>,
  file: FileInfo
) {
  if (filePreviewQuery.isFetching) return <Icon type="Loader" />;
  if (isFilePreviewable(file) && filePreviewQuery.data) {
    return (
      <img src={filePreviewQuery.data} alt={`File ${file.name} preview`} />
    );
  }
  return <DocumentIcon file={file.name} style={{ height: 36, width: 36 }} />;
}
