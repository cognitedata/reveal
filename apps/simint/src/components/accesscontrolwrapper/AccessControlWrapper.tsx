/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from 'react';

import { useCheckAcl } from '../../hooks/useCheckAcl';
import { PermissionsRequired } from '../../pages/emptystates/permissions-required';

interface Props {
  requiredCapabilities: string[];
}

export function AccessControlWrapper({
  children,
  requiredCapabilities,
}: React.PropsWithChildren<Props>) {
  const { hasAllCapabilities } = useCheckAcl(requiredCapabilities);

  if (!hasAllCapabilities) {
    // will render the permissions page if the user does not have all capabilities
    return <PermissionsRequired />;
  }

  return children;
}
