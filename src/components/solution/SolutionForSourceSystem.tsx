import React, { useState } from 'react';

import {
  Body,
  Colors,
  Elevations,
  Flex,
  Icon,
  Link,
  Title,
} from '@cognite/cogs.js';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

import { Solution as SolutionType } from 'hooks/useSolutions';
import { useTranslation } from 'common';
import { useSourceSystem } from 'hooks/useSourceSystems';
import { useExtractor } from 'hooks/useExtractorsList';

import Arrow from 'assets/Arrow.svg';
import { useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

type SolutionForSourceSystemProps = SolutionType;

const SolutionForSourceSystem = ({
  documentation,
  extractorExternalId,
  sourceSystemExternalId,
}: SolutionForSourceSystemProps): JSX.Element => {
  const { t } = useTranslation();

  const { subAppPath } = useParams<{ subAppPath?: string }>();

  const { data: sourceSystem } = useSourceSystem(sourceSystemExternalId);
  const { data: extractor } = useExtractor(extractorExternalId);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleClick = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  return (
    <StyledSolutionContainer onClick={handleClick}>
      <StyledHeading>
        <Flex alignItems="center" gap={8}>
          <StyledCollapseIcon
            type={isCollapsed ? 'ChevronDown' : 'ChevronRight'}
          />
          <StyledConnection>
            <StyledLogoContainer>
              <StyledLogo src={sourceSystem?.imageUrl} />
            </StyledLogoContainer>
            <StyledLogoContainer>
              <StyledLogo src={extractor?.imageUrl} />
            </StyledLogoContainer>
            <StyledArrow src={Arrow} />
          </StyledConnection>
          <Title level={6}>
            {t('connect-to-source-system-via-extractor-with-name', {
              extractor: extractor?.name,
              sourceSystem: sourceSystem?.name,
            })}
          </Title>
        </Flex>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Link
            href={createLink(`/${subAppPath}/extractor/${extractorExternalId}`)}
            target="_blank"
          >
            {t('go-to-extractor')}
          </Link>
        </div>
      </StyledHeading>
      {isCollapsed && (
        <StyledContent>
          <ReactMarkdown>{documentation}</ReactMarkdown>
        </StyledContent>
      )}
    </StyledSolutionContainer>
  );
};

export const StyledSolutionContainer = styled.button`
  background-color: ${Colors['surface--muted']};
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  text-align: left;

  &:hover {
    box-shadow: ${Elevations['elevation--surface--interactive--hover']};
    transition: box-shadow 500ms ease;
  }
`;

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
`;

const StyledContent = styled(Body).attrs({ level: 2 })`
  p {
    margin-bottom: 0;
  }
`;

const StyledCollapseIcon = styled(Icon)`
  margin-right: 8px;
`;

const StyledConnection = styled.div`
  display: flex;
  gap: 12px;
  position: relative;
`;

const StyledArrow = styled.img`
  left: 30px;
  position: absolute;
  top: 14px;
`;

const StyledLogoContainer = styled.div`
  align-items: center;
  background-color: ${Colors['surface--strong']};
  border-radius: 6px;
  display: flex;
  height: 36px;
  justify-content: center;
  padding: 10px;
  width: 36px;
`;

const StyledLogo = styled.img`
  max-height: 16px;
  max-width: 16px;
`;

export default SolutionForSourceSystem;
