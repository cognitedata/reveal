import { useParsingJob } from 'modules/contextualization/pnidParsing/hooks';
import { ApiStatusCount } from 'modules/contextualization/pnidParsing';

export const useFileStatus = (workflowId: number, file: any) => {
  const {
    status: parsingJobStatus,
    jobId,
    failedFiles,
  } = useParsingJob(workflowId);

  const didFileFail = failedFiles?.find(
    (failedFile) => failedFile.fileId === file?.id
  );

  const getStatus = (): keyof ApiStatusCount | 'idle' => {
    if (!jobId) return 'idle';
    if (didFileFail || parsingJobStatus === 'Failed') return 'failed';
    if (parsingJobStatus === 'Queued') return 'queued';
    if (parsingJobStatus === 'Completed') return 'completed';
    return 'running';
  };
  const status = getStatus();

  return { status, didFileFail };
};
