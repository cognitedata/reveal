import { Loader } from '@cognite/cogs.js';
import { useUserPermissions } from 'apps/cdf-document-search/src/hooks/useUserPermissions';
import { NoAccessPage } from 'apps/cdf-document-search/src/pages/NoAccess';
import React from 'react';

export const PermissionWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { missingPermissions, isLoading } = useUserPermissions();

  if (isLoading) {
    return <Loader darkMode />;
  }

  if (missingPermissions && missingPermissions.length > 0) {
    return <NoAccessPage missingPermissions={missingPermissions} />;
  }

  return <>{children}</>;
};
