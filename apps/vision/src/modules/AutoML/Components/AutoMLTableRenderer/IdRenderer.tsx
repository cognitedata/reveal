import React from 'react';

import { AutoMLTableDataType } from '@vision/modules/AutoML/Components/AutoMLModelList';
import { CopyableText } from '@vision/modules/FileDetails/Components/FileMetadata/CopyableText';

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
