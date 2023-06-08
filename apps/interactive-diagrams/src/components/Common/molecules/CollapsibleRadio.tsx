import React from 'react';
import styled from 'styled-components';
import { Colors, Radio, Title, Icon, Tooltip } from '@cognite/cogs.js';
import { Flex } from '../atoms';

type WrapperProps = {
  checked: boolean;
  maxWidth?: number;
  style?: React.CSSProperties;
};
const Wrapper = styled.div.attrs(
  ({ checked, maxWidth, style = {} }: WrapperProps) => {
    const newStyle: React.CSSProperties = {
      ...style,
      border: checked
        ? '2px solid #4A67FB'
        : `2px solid ${Colors['decorative--grayscale--400']}`,
    };
    if (maxWidth) {
      newStyle.maxWidth = `${maxWidth}px`;
    }
    return { style: newStyle };
  }
)<WrapperProps>`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  justify-content: flex-start;
  align-items: flex-start;
  .cogs-radio {
    width: 100%;
    height: 100%;
    user-select: none;
    cursor: pointer;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 14px;
    .radio-ui {
      width: 16px;
      height: 16px;
      min-width: 16px;
      min-height: 16px;
      margin: 1px 8px 1px 0;
    }
  }
  .cogs-radio input[type='radio']:checked + .radio-ui:after {
    width: 8px;
    height: 8px;
    top: calc(50% - 8px / 2);
    left: calc(50% - 8px / 2);
  }
  span.text {
    flex-grow: 1;
  }
`;

const Collapse = styled.div`
  border-top: 1px solid ${Colors['decorative--grayscale--400']};
  width: 100%;
  padding: 14px;
`;

interface CollapsibleRadioProps {
  children?: React.ReactNode;
  collapse?: React.ReactNode;
  groupRadioValue: string;
  info?: React.ReactNode;
  maxWidth?: number;
  name: string;
  setGroupRadioValue: (groupRadioValue: string) => void;
  style?: React.CSSProperties;
  title?: string;
  value: string;
}

export const CollapsibleRadio = ({
  children,
  collapse,
  groupRadioValue,
  info,
  maxWidth,
  name,
  setGroupRadioValue,
  style,
  title,
  value,
}: CollapsibleRadioProps) => {
  const isChecked = value === groupRadioValue;
  const isCollapsed = !isChecked;

  return (
    <Wrapper checked={isChecked} style={style} maxWidth={maxWidth}>
      <ClickableArea
        onClick={() => {
          setGroupRadioValue(value);
        }}
      >
        <div>
          <Radio checked={isChecked} name={name} value={value} />
        </div>
        <Flex
          column
          style={{
            padding: '14px 14px 14px 0',
            width: '100%',
          }}
        >
          <Flex row align style={{ justifyContent: 'space-between' }}>
            {title ? <Title level={5}>{title}</Title> : null}
            {info && (
              <Tooltip content={info}>
                <Icon type="Info" />
              </Tooltip>
            )}
          </Flex>
          {children ?? null}
        </Flex>
      </ClickableArea>
      {collapse && !isCollapsed && <Collapse>{collapse}</Collapse>}
    </Wrapper>
  );
};

const ClickableArea = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;
