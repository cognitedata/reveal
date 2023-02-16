import { useFlag } from '@cognite/react-feature-flags';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from 'utils/cogniteSdk';

export const useWithExtpipes = () => {
  const { isEnabled: isFlagExtpipe } = useFlag('EXTPIPES_allowlist', {
    fallback: false,
    forceRerender: true,
  });
  const { flow } = getFlow();
  const { data: hasExtpipesPermission, ...queryProps } = usePermissions(
    flow,
    'extractionPipelinesAcl',
    'READ'
  );

  const withExtpipes = isFlagExtpipe && hasExtpipesPermission;
  return { data: withExtpipes, ...queryProps };
};
