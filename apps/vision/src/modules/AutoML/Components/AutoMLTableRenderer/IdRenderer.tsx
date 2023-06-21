import React from 'react';
import { CopyableText } from 'src/modules/FileDetails/Components/FileMetadata/CopyableText';
import { AutoMLTableDataType } from 'src/modules/AutoML/Components/AutoMLModelList';

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
