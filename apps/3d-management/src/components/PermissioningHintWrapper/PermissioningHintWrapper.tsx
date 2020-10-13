import React, { ReactChild, ReactChildren, ReactNode } from 'react';
import Tooltip from 'antd/lib/tooltip';
import { getContainer } from 'utils';

export default ({
  children,
  hasPermission = false,
}: {
  children: ReactChild | ReactChildren;
  hasPermission?: boolean;
}): ReactNode => {
  if (hasPermission) {
    return children;
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
