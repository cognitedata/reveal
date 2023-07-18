/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from 'react';
import { Navigate, useMatchRoute } from 'react-location';

import { PERMISSIONS_REQUIRED_PAGE_PATH } from 'components/app/constants';
import type { RequiredCapability } from 'hooks/useCheckAcl';
import { useCheckAcl } from 'hooks/useCheckAcl';

interface Props {
  requiredCapabilities: RequiredCapability[];
}

export function AccessControlWrapper({
  children,
  requiredCapabilities,
}: React.PropsWithChildren<Props>) {
  const { hasAllCapabilities } = useCheckAcl(requiredCapabilities);
  const matchRoute = useMatchRoute();

  const isOnPermissionsPage = !!matchRoute({
    to: PERMISSIONS_REQUIRED_PAGE_PATH,
    fuzzy: true,
  });

  return (
    <>
      {isOnPermissionsPage || hasAllCapabilities ? (
        children
      ) : (
        <Navigate to={PERMISSIONS_REQUIRED_PAGE_PATH} />
      )}
    </>
  );
}
