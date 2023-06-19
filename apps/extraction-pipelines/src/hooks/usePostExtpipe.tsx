import { useMutation } from '@tanstack/react-query';

import { CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { Extpipe, RegisterExtpipeInfo } from '../model/Extpipe';
import { registerExtpipe } from '../utils/ExtpipesAPI';

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
