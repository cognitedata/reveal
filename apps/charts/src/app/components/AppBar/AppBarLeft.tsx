import { Flex } from '@cognite/cogs.js';
import PortalWait from '@charts-app/components/PortalWait/PortalWait';
import { FC } from 'react';

const AppBarLeft: FC = (props) => {
  return (
    <PortalWait elementId="appbar-left">
      <Flex style={{ height: '100%' }}>{props.children}</Flex>
    </PortalWait>
  );
};

export default AppBarLeft;
