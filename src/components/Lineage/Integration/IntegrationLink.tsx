import React, { FunctionComponent, PropsWithChildren } from 'react';
import { createLink } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { Integration } from 'utils/types';
import { getExtractionPipelineUIUrl } from '../../../utils/integrationUtils';

const StyledLink = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

interface IntegrationLinkProps {
  integration: Integration;
}

export const IntegrationLink: FunctionComponent<IntegrationLinkProps> = ({
  integration,
}: PropsWithChildren<IntegrationLinkProps>) => {
  const clickLink: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.stopPropagation();
  };
  return (
    <StyledLink
      href={createLink(
        getExtractionPipelineUIUrl(`/extpipe/${integration.id}`)
      )}
      onClick={clickLink}
    >
      {integration.name}
    </StyledLink>
  );
};
