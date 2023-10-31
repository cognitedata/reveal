import { useFlag } from '@cognite/react-feature-flags';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

export const useWithExtpipes = () => {
  const { isEnabled: isFlagExtpipe } = useFlag('EXTPIPES_allowlist', {
    fallback: false,
    forceRerender: true,
  });
  const { data: hasExtpipesPermission, ...queryProps } = usePermissions(
    'extractionPipelinesAcl',
    'READ'
  );

  const withExtpipes = isFlagExtpipe && hasExtpipesPermission;
  return { data: withExtpipes, ...queryProps };
};
