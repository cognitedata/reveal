import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

export function useAnnotationJobs() {
  return useSelector((state: RootState) => {
    const { jobByFileId } = state.processSlice;
    const { uploadedFiles } = state.uploadedFiles;
    const isPollingFinished = uploadedFiles.every((file) => {
      const job = jobByFileId[file.id];
      if (!job) {
        return false;
      }
      return job.status === 'COMPLETED' || job.status === 'FAILED';
    });
    return { isPollingFinished, jobByFileId };
  });
}
