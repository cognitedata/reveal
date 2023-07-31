import { useUserRoles } from 'domain/user/internal/hooks/useUserRoles';

import * as React from 'react';

export const Admin: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { data: roles } = useUserRoles();

  if (roles && roles.isAdmin) {
    return children as React.ReactElement;
  }

  return null;
};
