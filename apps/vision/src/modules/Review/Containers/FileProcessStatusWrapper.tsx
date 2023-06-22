import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { makeSelectJobStatusForFile } from '@vision/modules/Process/store/selectors';
import { isProcessingFile } from '@vision/modules/Process/store/utils';
import { RootState } from '@vision/store/rootReducer';

export const FileProcessStatusWrapper = ({
  fileId,
  children,
}: {
  fileId: number;
  children: ({
    isFileProcessing,
  }: {
    isFileProcessing: boolean;
  }) => JSX.Element;
}): JSX.Element => {
  const getAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, fileId)
  );
  const isFileProcessing = isProcessingFile(annotationStatuses);

  return children({ isFileProcessing });
};
