import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { makeSelectJobStatusForFile } from 'src/modules/Process/store/selectors';
import { isProcessingFile } from 'src/modules/Process/store/utils';
import { RootState } from 'src/store/rootReducer';

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
  console.log('');

  return children({ isFileProcessing });
};
