import React, { useState } from 'react';

import { Colors, Elevations, Flex, Icon, Link, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Solution as SolutionType } from 'hooks/useSolutions';
import { useTranslation } from 'common';
import { useSourceSystem } from 'hooks/useSourceSystems';
import { useExtractor } from 'hooks/useExtractorsList';

import { useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import Markdown from 'components/markdown';

type SolutionForSourceSystemProps = SolutionType & {
  isInitiallyCollapsed?: boolean;
};

const SolutionForSourceSystem = ({
  documentation,
  extractorExternalId,
  sourceSystemExternalId,
  isInitiallyCollapsed,
}: SolutionForSourceSystemProps): JSX.Element => {
  const { t } = useTranslation();

  const { subAppPath } = useParams<{ subAppPath?: string }>();

  const { data: sourceSystem } = useSourceSystem(sourceSystemExternalId);
  const { data: extractor } = useExtractor(extractorExternalId);

  const [isCollapsed, setIsCollapsed] = useState(isInitiallyCollapsed);

  const handleClick = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  return (
    <StyledSolutionContainer>
      <StyledHeading onClick={handleClick}>
        <Flex alignItems="center" gap={8}>
          <StyledCollapseIcon
            type={isCollapsed ? 'ChevronDown' : 'ChevronRight'}
          />
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
      {isCollapsed && <Markdown content={documentation} />}
    </StyledSolutionContainer>
  );
};

export const StyledSolutionContainer = styled.div`
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
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

const StyledHeading = styled.button`
  align-items: center;
  background-color: ${Colors['surface--muted']};
  border: none;
  cursor: pointer;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
`;

const StyledCollapseIcon = styled(Icon)`
  margin-right: 8px;
`;

export default SolutionForSourceSystem;
