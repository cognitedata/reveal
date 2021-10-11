import React from 'react';

import { useUserRoles } from 'modules/api/user/useUserQuery';

export const Admin: React.FC = ({ children }) => {
  const { data: roles } = useUserRoles();

  if (roles && roles.isAdmin) {
    return children as React.ReactElement;
  }

  return null;
};
