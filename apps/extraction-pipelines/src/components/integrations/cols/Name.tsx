import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Colors } from '@cognite/cogs.js';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import { useAppEnv } from 'hooks/useAppEnv';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';

export const StyledRouterLink = styled((props) => (
  <Link {...props}>{props.children}</Link>
))`
  color: ${Colors.black.hex()};
  margin-right: 0.5rem;
  &:hover {
    text-decoration: underline;
  }
`;
interface OwnProps {
  name: string;
  integrationId: string;
  selected: boolean;
}

type Props = OwnProps;

const Name: FunctionComponent<Props> = ({
  name,
  integrationId,
  selected,
}: Props) => {
  const { cdfEnv, project } = useAppEnv();
  return (
    <StyledRouterLink
      id={`integration-${name}`}
      to={{
        pathname: `/${project}/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${integrationId}`,
        search: cdfEnv ? `?env=${cdfEnv}` : '',
      }}
      aria-selected={selected}
    >
      {name}
    </StyledRouterLink>
  );
};

export default Name;
