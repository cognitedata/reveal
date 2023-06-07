import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Colors,
  Radio,
  RadioProps,
  Title,
  Icon,
  Tooltip,
} from '@cognite/cogs.js';
import { Flex } from 'components/Common';

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
        : `2px solid ${Colors['greyscale-grey4'].hex()}`,
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
  border-top: 1px solid ${Colors['greyscale-grey4'].hex()};
  width: 100%;
  padding: 14px;
`;

interface CollapsibleRadioProps extends RadioProps {
  children?: React.ReactNode;
  title?: string;
  info?: React.ReactNode;
  style?: React.CSSProperties;
  maxWidth?: number;
  groupRadioValue: string;
  setGroupRadioValue: (groupRadioValue: string) => void;
  collapse?: React.ReactNode;
}

export const CollapsibleRadio = ({
  title,
  children,
  info,
  collapse,
  maxWidth,
  groupRadioValue,
  setGroupRadioValue,
  style,
  ...otherProps
}: CollapsibleRadioProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const isThisRadioChecked = otherProps.value === groupRadioValue;
    setIsChecked(isThisRadioChecked);
    if (collapse) setCollapsed(!isThisRadioChecked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupRadioValue]);

  const onChange = (_isChecked: boolean, radioValue?: string) => {
    if (radioValue) setGroupRadioValue(radioValue);
  };

  return (
    <Wrapper checked={isChecked} style={style} maxWidth={maxWidth}>
      <Radio {...otherProps} checked={isChecked} onChange={onChange}>
        <Flex column style={{ width: '100%' }}>
          <Flex row align style={{ justifyContent: 'space-between' }}>
            {title ? <Title level={5}>{title}</Title> : null}
            {info && (
              <Tooltip content={info}>
                <Icon
                  type="Info"
                  style={{ color: Colors['greyscale-grey6'].hex() }}
                />
              </Tooltip>
            )}
          </Flex>
          {children ?? null}
        </Flex>
      </Radio>
      {collapse && !collapsed && <Collapse>{collapse}</Collapse>}
    </Wrapper>
  );
};
