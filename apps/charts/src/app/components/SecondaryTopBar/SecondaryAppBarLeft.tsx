import { Flex } from '@cognite/cogs.js';
import PortalWait from 'components/PortalWait/PortalWait';
import { FC } from 'react';

const SecondaryTopBarLeft: FC = (props) => {
  return (
    <PortalWait elementId="secondary-topbar-left">
      <Flex style={{ height: '100%' }}>{props.children}</Flex>
    </PortalWait>
  );
};

export default SecondaryTopBarLeft;
