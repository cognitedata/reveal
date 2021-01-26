import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Colors } from '@cognite/cogs.js';
import { useAppEnv } from '../../../hooks/useAppEnv';
import { INTEGRATIONS } from '../../../utils/baseURL';

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
        pathname: `/${project}/${INTEGRATIONS}/${integrationId}`,
        search: cdfEnv ? `?env=${cdfEnv}` : '',
      }}
      aria-selected={selected}
    >
      {name}
    </StyledRouterLink>
  );
};

export default Name;
