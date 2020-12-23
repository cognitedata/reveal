import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

const Email = styled.a`
  color: ${Colors['midblue-3'].hex()};
  margin: 0;
`;

interface OwnProps {
  // eslint-disable-next-line
  email?: string;
}

type Props = OwnProps;

const EmailLink: FunctionComponent<Props> = ({ email }: OwnProps) => {
  const mailtoLink = `mailto:${email}`;
  return <>{email && <Email href={mailtoLink}>{email}</Email>}</>;
};

export default EmailLink;
