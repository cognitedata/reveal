import { useQuery } from '@tanstack/react-query';

import {
  CogniteAnnotation,
  listAnnotationsForFile,
} from '@cognite/annotations';
import { FileInfo as File } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const useEventAnnotations = (
  file?: File
): { data: CogniteAnnotation[] | undefined } => {
  const sdk = useSDK();

  return useQuery<CogniteAnnotation[]>(
    ['annotations', file?.id],
    async () => listAnnotationsForFile(sdk, file!),
    { enabled: !!file }
  );
};
