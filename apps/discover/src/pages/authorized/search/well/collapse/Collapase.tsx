import { PropsWithChildren } from 'react';

import { Collapse } from '@cognite/cogs.js';

const { Panel } = Collapse;

interface Props {
  name: string;
}

export const CollapseWrapper = ({
  children,
  name,
}: PropsWithChildren<Props>) => (
  <div>
    <Collapse accordion>
      <Panel header={name}>{children}</Panel>
    </Collapse>
  </div>
);
