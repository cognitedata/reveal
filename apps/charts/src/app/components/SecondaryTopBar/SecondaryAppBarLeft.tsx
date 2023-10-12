import { Flex } from '@cognite/cogs.js';

import PortalWait from '../PortalWait/PortalWait';

const SecondaryTopBarLeft = (props: { children: React.ReactNode }) => {
  return (
    <PortalWait elementId="secondary-topbar-left">
      <Flex style={{ height: '100%' }}>{props.children}</Flex>
    </PortalWait>
  );
};

export default SecondaryTopBarLeft;
