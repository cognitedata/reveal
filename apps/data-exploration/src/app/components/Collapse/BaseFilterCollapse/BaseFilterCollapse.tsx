import * as React from 'react';

import { EXPLORATION } from '../../../constants/metrics';
import { trackUsage } from '../../../utils/Metrics';
import { ResetButton } from '../../Buttons/ResetButton';

import { BaseFilterHeader } from './BaseFilterHeader';
import { Collapse, Container, Panel } from './elements';

// Might need this in the near future. Leaving for now
// const CollapseIcon: React.FC<CollapsePanelProps> = ({ isActive }) => {
//   return (
//     <StyledCollapseIcon type="ChevronDown" active={`${isActive}`} /> // note: active is string?!?!
//   );
// };

const NoIcon = () => null;

interface BaseFilterCollapseProps {
  children: React.ReactNode;
}
export const BaseFilterCollapse = ({
  children,
  ...rest
}: BaseFilterCollapseProps) => {
  const [activeKeys, _setActiveKeys] = React.useState(['0', '1']);

  return (
    <Collapse
      {...rest}
      activeKey={activeKeys}
      // Might be we will support collapse in the near future! Leaving this here.
      // onChange={keys => {
      //   setActiveKeys(keys as unknown as string[]);
      // }}
      ghost
      // expandIcon={CollapseIcon}
      expandIcon={NoIcon}
    >
      {children}
    </Collapse>
  );
};

export interface BaseFilterPanelProps {
  children: React.ReactNode;
  title: string;
  infoContent?: string;
  hideResetButton?: boolean;
  onResetClick?: () => void;
}
export const BaseFilterPanel = ({
  children,
  title,
  infoContent,
  hideResetButton,
  onResetClick,
  ...rest
}: BaseFilterPanelProps) => {
  return (
    <Panel
      {...rest}
      header={
        <Container>
          <BaseFilterHeader title={title} infoContent={infoContent} />
          {!hideResetButton && (
            <ResetButton
              onClick={() => {
                onResetClick && onResetClick();
                trackUsage(EXPLORATION.CLICK.RESET_FILTER, { title });
              }}
            />
          )}
        </Container>
      }
      key={title?.split(' ').join('-')}
    >
      {children}
    </Panel>
  );
};

BaseFilterCollapse.Panel = BaseFilterPanel;
