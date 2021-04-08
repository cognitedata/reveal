import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectAllFiles } from 'src/store/uploadedFilesSlice';
import { selectJobsByFileId } from 'src/store/processSlice';

export function useAnnotationJobs() {
  return useSelector((state: RootState) => {
    const uploadedFiles = selectAllFiles(state.uploadedFiles);
    const isPollingFinished = uploadedFiles.every((file) => {
      const jobs = selectJobsByFileId(state.processSlice, file.id);
      if (!jobs || !jobs.length) {
        return true;
      }
      return jobs.every(
        (job) => job.status === 'Completed' || job.status === 'Failed'
      );
    });
    return { isPollingFinished };
  });
}
