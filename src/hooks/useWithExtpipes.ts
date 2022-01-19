import { useFlag } from '@cognite/react-feature-flags';
import { useUserCapabilities } from 'hooks/useUserCapabilities';

export const useWithExtpipes = () => {
  const isFlagExtpipe = useFlag('EXTPIPES_allowlist', {
    fallback: false,
    forceRerender: true,
  });
  const { data: hasExtpipesPermission, ...queryProps } = useUserCapabilities(
    'extractionPipelinesAcl',
    'READ'
  );

  const withExtpipes = isFlagExtpipe && hasExtpipesPermission;
  return { data: withExtpipes, ...queryProps };
};
