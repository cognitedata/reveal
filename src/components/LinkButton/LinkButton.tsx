import { AllIconTypes, Icon } from '@cognite/cogs.js';
import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const StyledA = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
`;

type Props = { href: string; icon: AllIconTypes };
const LinkButton = (props: PropsWithChildren<Props>) => (
  <StyledA href={props.href} className="cogs-btn cogs-btn-primary">
    <Icon type={props.icon} />
    {props.children}
  </StyledA>
);

export default LinkButton;
