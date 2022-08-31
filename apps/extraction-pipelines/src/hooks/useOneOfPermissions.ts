// MaybeDo: Move to '@cognite/sdk-react-query-hooks'
import { AclAction } from 'model/AclAction';
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';

export const useOneOfPermissions = (wantedAclActions: AclAction[]) => {
  const { flow } = getFlow();
  const capabilitiesResult = useCapabilities(flow);
  const capabilities = capabilitiesResult.data;
  const hasPermission: boolean =
    capabilities != null &&
    wantedAclActions.some((wantedAclAction) =>
      capabilities
        .filter((c) => c.acl === wantedAclAction.acl)
        .some((acl) =>
          acl.actions.some(
            (a) => a.toLowerCase() === wantedAclAction.action.toLowerCase()
          )
        )
    );

  return {
    ...capabilitiesResult,
    data: hasPermission,
  };
};
