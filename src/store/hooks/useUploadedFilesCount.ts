import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectAllFiles } from 'src/store/uploadedFilesSlice';

export function useUploadedFilesCount() {
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );
  const count = uploadedFiles.length;
  const fileOrFiles = count % 10 === 1 && count % 100 !== 11 ? 'file' : 'files';
  const countStr = `${count} ${fileOrFiles}`;
  return { count, countStr };
}
