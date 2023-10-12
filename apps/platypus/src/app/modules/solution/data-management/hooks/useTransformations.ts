import { useQuery } from '@tanstack/react-query';

import { TOKENS } from '../../../../di';
import { useInjection } from '../../../../hooks/useInjection';
import { QueryKeys } from '../../../../utils/queryKeys';

export default function useTransformations({
  space,
  isEnabled,
  typeName,
  viewVersion,
}: {
  space: string;
  isEnabled: boolean;
  typeName: string;
  viewVersion?: string;
}) {
  const dataManagementHandler = useInjection(TOKENS.DataManagementHandler);
  const query = useQuery(
    QueryKeys.TRANSFORMATION(space, typeName, viewVersion || ''),
    async () => {
      return dataManagementHandler.getTransformations({
        spaceExternalId: space,
        instanceSpaceExternalId: space,
        typeName,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        viewVersion: viewVersion!,
      });
    },
    {
      enabled: !typeName.includes('undefined') && isEnabled && !!viewVersion,
    }
  );

  return query;
}
