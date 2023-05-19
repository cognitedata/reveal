import React from 'react';
import { Input, InputProps } from 'antd';
import { Icon, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

export type TableSearchProps = InputProps;

export const TableSearch = ({
  value,
  placeholder,
  ...props
}: TableSearchProps): JSX.Element => {
  return (
    <StyledInput
      prefix={<Icon type="Search" />}
      placeholder={placeholder}
      value={value}
      allowClear
      {...props}
    />
  );
};

const StyledInput = styled(Input)`
  &:focus-within {
    .ant-input-prefix {
      svg {
        color: ${Colors['decorative--blue--300']};
        path {
          fill: currentColor;
        }
      }
    }
  }
`;
