import { useSelector } from 'react-redux';
import { selectIsProcessing } from 'src/modules/Process/store/selectors';
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
  const isFileProcessing = useSelector(({ processSlice }: RootState) =>
    selectIsProcessing(processSlice, fileId)
  );

  return children({ isFileProcessing });
};
