import React, { PropsWithChildren } from 'react';

import { getContainer } from '@3d-management/utils';
import { Tooltip } from 'antd';

export default ({
  children,
  hasPermission = false,
}: PropsWithChildren<{ hasPermission?: boolean }>) => {
  if (hasPermission) {
    return <>{children} </>;
  }
  return (
    <Tooltip
      title="To gain access, please request permission from your administrator. You may need 3d:read, 3d:create, 3d:update, 3d:delete and files:read and files:write for full 3d access."
      getPopupContainer={getContainer}
    >
      {children}
    </Tooltip>
  );
};
