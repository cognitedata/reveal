import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../store/rootReducer';
import { makeSelectJobStatusForFile } from '../../Process/store/selectors';
import { isProcessingFile } from '../../Process/store/utils';

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
