import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import {
  Button,
  Colors,
  Dropdown,
  Flex,
  Heading,
  Icon,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';

import { CONTEXTUALIZE_EDITOR_HEADER_HEIGHT } from '../constants';

import RevisionDropdownMenu from './RevisionDropdownMenu';

type ContextualizeEditorHeaderProps = {
  modelId: string;
  revisionId: string;
};

export const ContextualizeEditorHeader = ({
  modelId,
  revisionId,
}: ContextualizeEditorHeaderProps) => {
  const navigate = useNavigate();
  const modelIdNumber = Number(modelId);
  const revisionIdNumber = Number(revisionId);

  const handleGoBackToThreeDModelsButtonClick = () => {
    navigate(createLink(`/3d-models`));
  };

  const onOpenInDataExplorer = () => {
    window.open(createLink(`/explore/threeD/${modelId}`), '_blank');
  };

  return (
    <TitleRowWrapper>
      <StyledGoBackWrapper>
        <Tooltip content="Go back to model page" position="bottom">
          <Button
            icon="ArrowLeft"
            aria-label="Go back to model page"
            onClick={handleGoBackToThreeDModelsButtonClick}
          />
        </Tooltip>
        <RevisionDropdownMenu
          modelId={modelIdNumber}
          revisionId={revisionIdNumber}
        />
      </StyledGoBackWrapper>

      <TitleWrapper>
        <Heading level={5}>Contextualization editor</Heading>
      </TitleWrapper>

      <MoreOptionsWrapper>
        <Dropdown
          content={
            <Menu>
              <Menu.Item onClick={onOpenInDataExplorer}>
                <Flex direction="row" gap={8} alignItems="center">
                  Open in Data Explorer
                  <Icon type="ExternalLink" />
                </Flex>
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon="EllipsisHorizontal" aria-label="More options" />
        </Dropdown>
      </MoreOptionsWrapper>
    </TitleRowWrapper>
  );
};

const TitleRowWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  padding: 10px 12px;
  height: ${CONTEXTUALIZE_EDITOR_HEADER_HEIGHT}px;
  border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
`;

const StyledGoBackWrapper = styled.div`
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const TitleWrapper = styled.div`
  flex: 1 1 auto;
  text-align: center; /* Center the title */
  padding: 0 15% 0 0;
  overflow: hidden;
`;

const MoreOptionsWrapper = styled.div`
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
  align-items: center;
`;
