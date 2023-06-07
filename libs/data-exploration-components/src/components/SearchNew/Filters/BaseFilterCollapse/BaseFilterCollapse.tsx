import * as React from 'react';

import { CollapsePanelProps } from '@cognite/cogs.js';

import { FilterTitle } from './BaseFilterTitle';
import { Collapse, StyledCollapseIcon, Container, Panel } from './elements';

const CollapseIcon: React.FC<CollapsePanelProps> = ({ isActive }) => {
  return (
    <StyledCollapseIcon type="ChevronDown" active={`${isActive}`} /> // note: active is string?!?!
  );
};

interface BaseFilterCollapseProps {
  children: React.ReactNode;
}
export const BaseFilterCollapse = ({
  children,
  ...rest
}: BaseFilterCollapseProps) => {
  const [activeKeys, setActiveKeys] = React.useState(['0', '1']);

  return (
    <Collapse
      {...rest}
      activeKey={activeKeys}
      onChange={(keys) => {
        setActiveKeys(keys as unknown as string[]);
      }}
      ghost
      expandIcon={CollapseIcon}
    >
      {children}
    </Collapse>
  );
};

interface BaseFilterPanelProps {
  children: React.ReactNode;
  title: string;
  showApplyButton?: boolean;
  handleApplyClick?: () => void;
  // headerTestId?: string;
}
export const BaseFilterPanel = ({
  children,
  title,
  ...rest
}: BaseFilterPanelProps) => {
  return (
    <Panel
      {...rest}
      header={
        <Container>
          <FilterTitle title={title} />
        </Container>
      }
      key={title?.split(' ').join('-')}
    >
      {children}
    </Panel>
  );
};

BaseFilterCollapse.Panel = BaseFilterPanel;
