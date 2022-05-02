import React from 'react';

import { Illustration, IllustrationType } from 'components/Illustration';

import { LOADING_TEXT, NO_RESULTS_TEXT } from './constants';
import {
  Container,
  Content,
  StyledTypography,
  Text,
  ChildrenContainer,
  SubTitleText,
  SubtitleContainer,
} from './elements';

interface Props {
  loadingTitle?: string;
  loadingSubtitle?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  img?: IllustrationType;
  isLoading?: boolean;
}

const EmptyState: React.FC<Props> = ({
  loadingTitle = LOADING_TEXT,
  loadingSubtitle,
  emptyTitle = NO_RESULTS_TEXT,
  emptySubtitle,
  img = 'Search',
  isLoading = false,
  children,
}) => {
  return (
    <Container data-testid="empty-state-container">
      <Content>
        <Illustration type={img} />
        <StyledTypography variant="h6" weight="semibold">
          <Text visible={isLoading}>{loadingTitle}</Text>
          <Text visible={!isLoading}>{emptyTitle}</Text>
        </StyledTypography>
        <StyledTypography>
          {loadingSubtitle && (
            <SubtitleContainer>
              <SubTitleText visible={isLoading}>{loadingSubtitle}</SubTitleText>
            </SubtitleContainer>
          )}
          {emptySubtitle && (
            <SubtitleContainer>
              <SubTitleText visible={!isLoading}>{emptySubtitle}</SubTitleText>
            </SubtitleContainer>
          )}
        </StyledTypography>

        {!isLoading && <ChildrenContainer>{children}</ChildrenContainer>}
      </Content>
    </Container>
  );
};

export default EmptyState;
