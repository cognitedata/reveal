import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import { Icon, Title } from '@cognite/cogs.js';

import { Solution as SolutionType } from '../../hooks/useSolutions';
import { useSourceSystem } from '../../hooks/useSourceSystems';

import { StyledSolutionContainer } from './SolutionForSourceSystem';

type SolutionForExtractorProps = SolutionType;

const SolutionForExtractor = ({
  sourceSystemExternalId,
}: SolutionForExtractorProps): JSX.Element => {
  const { subAppPath } = useParams<{ subAppPath?: string }>();

  const navigate = useNavigate();

  const { data: sourceSystem } = useSourceSystem(sourceSystemExternalId);

  const handleClick = (): void => {
    navigate(
      createLink(`/${subAppPath}/source-system/${sourceSystemExternalId}`)
    );
  };

  return (
    <StyledSolutionContainer onClick={handleClick}>
      <StyledContent>
        <Title level={6}>{sourceSystem?.name}</Title>
        <Icon type="ChevronRight" />
      </StyledContent>
    </StyledSolutionContainer>
  );
};

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export default SolutionForExtractor;
