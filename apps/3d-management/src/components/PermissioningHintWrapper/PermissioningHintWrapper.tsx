import React, { PropsWithChildren } from 'react';
import Tooltip from 'antd/lib/tooltip';
import { getContainer } from 'src/utils';

export default ({
  children,
  hasPermission = false,
}: PropsWithChildren<{ hasPermission?: boolean }>) => {
  if (hasPermission) {
    return <>{children}</>;
  }
  return (
    <Tooltip
      title="To gain access, please request permission from your administrator."
      getPopupContainer={getContainer}
    >
      {children}
    </Tooltip>
  );
};
