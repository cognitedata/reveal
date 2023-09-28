import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import {
  Button,
  Colors,
  Divider,
  Dropdown,
  Flex,
  Heading,
  Icon,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';

import { useThreeDModelName } from '../../components/ContextualizeThreeDViewer/hooks/useThreeDModelName';

import { CONTEXTUALIZE_EDITOR_HEADER_HEIGHT } from './constants';

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
  const modelName = useThreeDModelName(modelIdNumber);

  const handleGoBackToIndustryCanvasButtonClick = () => {
    navigate(createLink(`/3d-models/${modelId}/revisions/${revisionId}`));
  };

  const onOpenInDataExplorer = () => {
    // Open in new tab
    window.open(createLink(`/explore/threeD/${modelId}`), '_blank');
  };

  return (
    <TitleRowWrapper>
      <PreviewLinkWrapper>
        <Flex alignItems="center" gap={8}>
          <Tooltip content="Go back to model page" position="bottom">
            <Button
              icon="ArrowLeft"
              aria-label="Go back to model page"
              onClick={handleGoBackToIndustryCanvasButtonClick}
            />
          </Tooltip>
          <Heading level={5}>Contextualize editor</Heading>
        </Flex>
      </PreviewLinkWrapper>

      <StyledGoBackWrapper>
        <StyledInfoContainer>
          <StyledInfoText>
            <Heading level={5}>{modelName}</Heading>
          </StyledInfoText>
          <StyledInfoText>Revision: {revisionId}</StyledInfoText>
        </StyledInfoContainer>

        <Divider direction="vertical" length="20px" endcap="round" />

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
      </StyledGoBackWrapper>
    </TitleRowWrapper>
  );
};

const TitleRowWrapper = styled.div`
  h1 {
    margin: 0px;
  }
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 10px 12px;
  height: ${CONTEXTUALIZE_EDITOR_HEADER_HEIGHT}px;
  border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
`;

const PreviewLinkWrapper = styled.div`
  overflow: hidden;
  vertical-align: bottom;
  flex: 1 1 auto;
`;

const StyledGoBackWrapper = styled.div`
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledInfoContainer = styled.div`
  padding: 10px 12px;
  border-radius: 4px;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StyledInfoText = styled.p`
  margin: 0;
  font-size: 12px;
`;
