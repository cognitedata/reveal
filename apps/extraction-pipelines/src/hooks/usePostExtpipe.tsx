import { useMutation } from '@tanstack/react-query';
import { Extpipe, RegisterExtpipeInfo } from 'model/Extpipe';
import { registerExtpipe } from 'utils/ExtpipesAPI';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteError } from '@cognite/sdk';

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
