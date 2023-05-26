import React, { PropsWithChildren, useCallback, useRef } from 'react';

import styled from 'styled-components';

import { Dropdown, DropdownProps } from 'antd';

import { Body, Button, Colors, Flex, Menu } from '@cognite/cogs.js';

export type TableFilterProps = {
  menuTitle?: string;
  clearText?: string;
  submitText?: string;
  buttonText?: string;
  onClear: () => void;
  onApply: () => void;
  visible: boolean;
  onVisibleChange: DropdownProps['onVisibleChange'];
};

export const TableFilter = ({
  menuTitle,
  clearText,
  children,
  submitText,
  buttonText,
  onClear,
  onApply,
  visible,
  onVisibleChange,
}: PropsWithChildren<TableFilterProps>): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const getPopupContainer = useCallback(() => ref.current!, [ref]);
  return (
    <div ref={ref}>
      <Dropdown
        getPopupContainer={getPopupContainer}
        overlay={
          <StyledMenu>
            <Flex gap={8} direction="column">
              <StyledMenuTitle>
                <Body level={2} strong>
                  {menuTitle}
                </Body>
                <Button type="ghost" size="small" onClick={onClear}>
                  {clearText || 'Clear filters'}
                </Button>
              </StyledMenuTitle>
              <Flex gap={8} direction="column">
                <StyledMenuContent>{children}</StyledMenuContent>
                <Button type="primary" onClick={onApply}>
                  {submitText || 'Apply'}
                </Button>
              </Flex>
            </Flex>
          </StyledMenu>
        }
        trigger={['click']}
        placement="bottomLeft"
        visible={visible}
        onVisibleChange={onVisibleChange}
      >
        <Button icon="Filter" type="secondary" toggled={visible}>
          {buttonText || 'Filter'}
        </Button>
      </Dropdown>
    </div>
  );
};

const StyledMenu = styled(Menu)`
  &&& {
    padding: 16px;
    min-width: 287px;
  }
`;

const StyledMenuTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledMenuContent = styled.div`
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
`;
