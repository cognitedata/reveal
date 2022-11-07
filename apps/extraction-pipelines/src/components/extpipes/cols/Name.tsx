import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Colors } from '@cognite/cogs.js';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';
import { createLink } from '@cognite/cdf-utilities';

export const StyledRouterLink = styled((props) => (
  <Link {...props}>{props.children}</Link>
))`
  color: ${Colors.black.hex()};
  margin-right: 0.5rem;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;
interface OwnProps {
  name: string;
  extpipeId: number;
}

type Props = OwnProps;

const Name: FunctionComponent<Props> = ({ name, extpipeId }: Props) => {
  return (
    <StyledRouterLink
      id={`extpipe-${name}`}
      to={{
        pathname: createLink(
          `/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${extpipeId}`
        ),
      }}
    >
      {name}
    </StyledRouterLink>
  );
};

export default Name;
