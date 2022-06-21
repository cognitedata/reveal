import { Flex } from '@cognite/cogs.js';
import PortalWait from 'components/PortalWait/PortalWait';
import { FC } from 'react';

const AppBarLeft: FC = (props) => {
  return (
    <PortalWait elementId="appbar-right">
      <Flex style={{ height: '100%' }}>{props.children}</Flex>
    </PortalWait>
  );
};

export default AppBarLeft;
