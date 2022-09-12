import { useMutation } from 'react-query';
import { ErrorVariations } from 'model/SDKErrors';
import { Extpipe, RegisterExtpipeInfo } from 'model/Extpipe';
import { registerExtpipe } from 'utils/ExtpipesAPI';
import { useSDK } from '@cognite/sdk-provider';

interface Props {
  extpipeInfo: Partial<RegisterExtpipeInfo>;
}
export const usePostExtpipe = () => {
  const sdk = useSDK();
  return useMutation<Extpipe, ErrorVariations, Props>({
    mutationFn: ({ extpipeInfo }) => {
      return registerExtpipe(sdk, extpipeInfo);
    },
  });
};
