import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

interface AddFieldInfoTextProps {}

const Styled = styled.span`
  display: flex;
  align-items: center;
  button:enabled > & {
    color: ${Colors.primary.hex()};
  }
`;

export const AddFieldInfoText: FunctionComponent<AddFieldInfoTextProps> = ({
  children,
}: PropsWithChildren<AddFieldInfoTextProps>) => {
  return (
    <Styled>
      <Icon type="Plus" style={{ marginRight: '1rem' }} /> add {children}
    </Styled>
  );
};
