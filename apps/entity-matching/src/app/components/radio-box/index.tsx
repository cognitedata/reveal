import styled from 'styled-components';

import { Radio as AntdRadio, RadioProps } from 'antd';

import { Body, Colors } from '@cognite/cogs.js';

const RadioBox = ({ children, ...otherProps }: RadioProps): JSX.Element => {
  return (
    <Radio {...otherProps}>
      <Body level={2} strong>
        {children}
      </Body>
    </Radio>
  );
};

const Radio = styled(AntdRadio)<{ checked?: boolean }>`
  background-color: ${({ checked }) =>
    checked
      ? Colors['surface--interactive--toggled-default']
      : Colors['surface--muted']};
  border: 2px solid
    ${({ checked }) =>
      checked
        ? Colors['border--interactive--toggled-default']
        : Colors['border--interactive--default']};
  border-radius: 6px;
  flex: 1;
  padding: 12px 14px;
`;

export default RadioBox;
