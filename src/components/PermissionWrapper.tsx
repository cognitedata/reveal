import { Loader } from '@cognite/cogs.js';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { NoAccessPage } from 'pages/NoAccess';
import React from 'react';

export const PermissionWrapper: React.FC = ({ children }) => {
  const { missingPermissions, isLoading } = useUserPermissions();

  if (isLoading) {
    return <Loader darkMode />;
  }

  if (missingPermissions && missingPermissions.length > 0) {
    return <NoAccessPage missingPermissions={missingPermissions} />;
  }

  return <>{children}</>;
};
