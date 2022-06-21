import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Colors } from '@cognite/cogs.js';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';
import { createRedirectLink } from 'utils/utils';

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
  extpipeId: string;
  selected: boolean;
}

type Props = OwnProps;

const Name: FunctionComponent<Props> = ({
  name,
  extpipeId,
  selected,
}: Props) => {
  return (
    <StyledRouterLink
      id={`extpipe-${name}`}
      to={{
        pathname: createRedirectLink(
          `/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${extpipeId}`
        ),
      }}
      aria-selected={selected}
    >
      {name}
    </StyledRouterLink>
  );
};

export default Name;
