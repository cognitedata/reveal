import React from 'react';

import { CopyableText } from '../../../FileDetails/Components/FileMetadata/CopyableText';
import { AutoMLTableDataType } from '../AutoMLModelList';

export const IdRenderer = ({
  rowData: { jobId },
}: {
  rowData: AutoMLTableDataType;
}) => {
  return (
    <CopyableText copyable text={jobId} copyIconColor="#595959">
      <>{jobId}</>
    </CopyableText>
  );
};
