import { FC } from 'react';

import PortalWait from '@charts-app/components/PortalWait/PortalWait';

import { Flex } from '@cognite/cogs.js';

const AppBarLeft: FC = (props) => {
  return (
    <PortalWait elementId="appbar-left">
      <Flex style={{ height: '100%' }}>{props.children}</Flex>
    </PortalWait>
  );
};

export default AppBarLeft;
