import type { ComponentType } from 'react';
import { useSelector } from 'react-redux';

import { selectCapabilities } from 'store/group/selectors';
import type { Capabilities } from 'store/group/types';

export function withRequireCapability<
  PropsType,
  RoleType extends keyof Capabilities,
  ActionsType extends Capabilities[RoleType]
>(requiredRole: RoleType, requiredActions: ActionsType) {
  return (Component: ComponentType<PropsType>) => (props: PropsType) => {
    const userCapabilities = useSelector(selectCapabilities);

    const hasRequiredCapabilities = requiredActions
      ?.map((requiredAction) =>
        userCapabilities[requiredRole]?.some(
          (userAction) => userAction === requiredAction
        )
      )
      .every((it) => it);

    if (!hasRequiredCapabilities) {
      return null;
    }

    return <Component {...props} />;
  };
}
