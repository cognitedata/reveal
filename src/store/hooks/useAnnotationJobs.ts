import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectAllFiles } from 'src/store/uploadedFilesSlice';

export function useAnnotationJobs() {
  return useSelector((state: RootState) => {
    const { jobsByFileId } = state.processSlice;
    const uploadedFiles = selectAllFiles(state.uploadedFiles);
    const isPollingFinished = uploadedFiles.every((file) => {
      const jobs = jobsByFileId[file.id];
      if (!jobs || !jobs.length) {
        return true;
      }
      return jobs.every(
        (job) => job.status === 'Completed' || job.status === 'Failed'
      );
    });
    return { isPollingFinished, jobsByFileId };
  });
}
