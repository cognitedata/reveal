import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
interface OwnProps {
  email?: string;
}

type Props = OwnProps;

const EmailLink: FunctionComponent<Props> = ({ email }: OwnProps) => {
  const mailtoLink = `mailto:${email}`;
  return <>{email && <Email href={mailtoLink}>{email}</Email>}</>;
};

const Email = styled.a`
  color: ${Colors['midblue-3'].hex()};
  margin: 0;
`;

export default EmailLink;
