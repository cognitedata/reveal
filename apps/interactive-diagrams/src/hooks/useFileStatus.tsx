import { useParsingJob } from 'hooks';
import { ApiStatusCount } from 'modules/types';

export const useFileStatus = (file: any) => {
  const d = useParsingJob();
  const { status: jobStatus, failedFiles } = d;

  const didFileFail = failedFiles?.find(
    (failedFile) => failedFile.fileId === file?.id
  );

  const getStatus = (): keyof ApiStatusCount | 'idle' => {
    if (jobStatus === 'incomplete') return 'idle';
    if (didFileFail || jobStatus === 'error' || jobStatus === 'rejected')
      return 'failed';
    if (jobStatus === 'loading' || jobStatus === 'running') return 'queued';
    if (jobStatus === 'done') return 'completed';
    return 'running';
  };
  const status = getStatus();

  return { status, didFileFail };
};
