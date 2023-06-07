import { FileInfo as File } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import {
  CogniteAnnotation,
  listAnnotationsForFile,
} from '@cognite/annotations';

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
