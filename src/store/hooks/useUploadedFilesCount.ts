// todo: remove unused function
import { useSelector } from 'react-redux';
import { selectAllFiles } from 'src/modules/Common/store/files/selectors';
import { RootState } from 'src/store/rootReducer';

export function useUploadedFilesCount() {
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.fileReducer)
  );
  const count = uploadedFiles.length;
  const fileOrFiles = count % 10 === 1 && count % 100 !== 11 ? 'file' : 'files';
  const countStr = `${count} ${fileOrFiles}`;
  return { count, countStr };
}
