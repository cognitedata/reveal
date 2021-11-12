import { useMutation } from 'react-query';
import { ErrorVariations } from 'model/SDKErrors';
import { Extpipe, RegisterExtpipeInfo } from 'model/Extpipe';
import { registerExtpipe } from 'utils/ExtpipesAPI';
import { useAppEnv } from './useAppEnv';

interface Props {
  extpipeInfo: Partial<RegisterExtpipeInfo>;
}
export const usePostExtpipe = () => {
  const { project } = useAppEnv();
  return useMutation<Extpipe, ErrorVariations, Props>(({ extpipeInfo }) => {
    return registerExtpipe(project ?? '', extpipeInfo);
  });
};
