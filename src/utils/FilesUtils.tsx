import { PnidsParsingJobSchema } from 'modules/types';

export const canDeploySelectedFiles = (
  parsingJob: PnidsParsingJobSchema,
  selectedKeys: number[]
) => {
  const failedSelectFiles =
    parsingJob.failedFiles?.filter((failedFile) =>
      selectedKeys.find((id) => id === failedFile.fileId)
    ) ?? [];

  if (!selectedKeys.length || failedSelectFiles.length) return false;
  return true;
};
