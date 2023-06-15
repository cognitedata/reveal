import React from 'react';
import { Link as ReactRouterLink, LinkProps } from 'react-router-dom';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

const Link = (props: LinkProps): JSX.Element => {
  return <StyledLink {...props} />;
};

const StyledLink = styled(ReactRouterLink)`
  color: ${Colors['text-icon--interactive--default']};

  :hover {
    color: ${Colors['text-icon--interactive--hover']};
    text-decoration: underline;
  }

  :active {
    color: ${Colors['text-icon--interactive--pressed']};
  }
`;

export default Link;
