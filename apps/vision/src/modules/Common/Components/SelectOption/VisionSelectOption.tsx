import React from 'react';
import { components, OptionProps } from 'react-select';

import styled from 'styled-components';

import { Icon, Menu, OptionType } from '@cognite/cogs.js';

import { VisionOptionType } from '../../../Review/types';

export const VisionSelectOption = (
  // @ts-expect-error ignoring errors for the migration
  props: OptionProps<OptionType<VisionOptionType<string>>>
) => {
  return (
    <>
      <components.Option {...props}>
        <CustomOptionContainer>
          <IconContainer
            style={{
              color: props.data?.color,
            }}
          >
            {props.data?.icon && <Icon type={props.data?.icon} />}
          </IconContainer>
          <CustomOptionLabel>{props.children}</CustomOptionLabel>
        </CustomOptionContainer>
      </components.Option>
      {props.data.divider && <Menu.Divider />}
    </>
  );
};

const CustomOptionContainer = styled.div`
  display: grid;
  grid-template-columns: 20px 1fr;
  grid-template-rows: 100%;
  grid-column-gap: 10px;
  place-items: center start;
  width: 100%;
`;

const CustomOptionLabel = styled.div`
  width: 100%;
  height: 100%;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
