import { ReactNode } from 'react';

import styled from 'styled-components';

import {
  Collapse as AntdCollapse,
  CollapseProps as AntdCollapseProps,
  CollapsePanelProps,
} from 'antd';

import { Body, Button, ButtonProps, Colors, Icon } from '@cognite/cogs.js';

enum CollapseVariants {
  danger = 'surface--status-critical--muted--default--alt',
  default = 'surface--muted',
  info = 'surface--status-neutral--muted--default--alt',
}

type CollapseProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  extraButton?: ButtonProps;
  iconPosition?: 'left' | 'right';
  panelProps?: CollapsePanelProps;
  title: string;
  type?: keyof typeof CollapseVariants;
} & Omit<
  AntdCollapseProps,
  'defaultActiveKey' | 'expandIconPosition' | 'expandIcon' | 'children'
>;

const Collapse = ({
  children,
  defaultOpen,
  extraButton,
  iconPosition = 'right',
  panelProps,
  title,
  type = 'default',
  ...props
}: CollapseProps): JSX.Element => (
  <StyledCollapse
    $backgroundColor={Colors[CollapseVariants[type]]}
    bordered={false}
    expandIcon={({ isActive }) => (
      <Icon type={isActive ? 'ChevronUp' : 'ChevronDown'} />
    )}
    expandIconPosition={iconPosition}
    {...(defaultOpen ? { defaultActiveKey: ['1'] } : {})}
    {...props}
  >
    <AntdCollapse.Panel
      key="1"
      header={
        <Body level={3} strong>
          {title}
        </Body>
      }
      {...(extraButton
        ? {
            extra: (
              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  extraButton?.onClick?.(e);
                }}
                {...extraButton}
              />
            ),
          }
        : {})}
      {...panelProps}
    >
      {children}
    </AntdCollapse.Panel>
  </StyledCollapse>
);

const StyledCollapse = styled(AntdCollapse)<{ $backgroundColor: string }>`
  background-color: ${(props) => props.$backgroundColor};
`;

export default Collapse;
