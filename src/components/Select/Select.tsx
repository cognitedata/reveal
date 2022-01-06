import React from 'react';

import { Select as AntdSelect, SelectProps } from 'antd';
import styled from 'styled-components';

const Select = (props: SelectProps<any>): JSX.Element => {
  return <StyledSelect {...(props as any)} />;
};

const StyledSelect = styled(AntdSelect)`
  width: 100%;

  && {
    .ant-select-selector {
      border: 2px solid var(--cogs-greyscale-grey4);
      border-width: 2px !important; /* overrides antd style */
      border-radius: 6px;
      box-shadow: none;
      height: 36px;
      padding: 2px 12px;
    }

    &:hover .ant-select-selector {
      border-color: var(--cogs-midblue-4) !important;
    }

    &.ant-select-focused .ant-select-selector {
      border-color: var(--cogs-midblue-4) !important;
      box-shadow: 0 0 0 1px var(--cogs-midblue-4) inset;
    }
  }
`;

Select.Option = AntdSelect.Option;
Select.OptGroup = AntdSelect.OptGroup;

export default Select;
