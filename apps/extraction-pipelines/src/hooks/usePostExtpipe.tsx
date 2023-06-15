import {
  Extpipe,
  RegisterExtpipeInfo,
} from '@extraction-pipelines/model/Extpipe';
import { registerExtpipe } from '@extraction-pipelines/utils/ExtpipesAPI';
import { useMutation } from '@tanstack/react-query';

import { CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

interface Props {
  extpipeInfo: Partial<RegisterExtpipeInfo>;
}
export const usePostExtpipe = () => {
  const sdk = useSDK();
  return useMutation<Extpipe, CogniteError, Props>({
    mutationFn: ({ extpipeInfo }) => {
      return registerExtpipe(sdk, extpipeInfo);
    },
  });
};
