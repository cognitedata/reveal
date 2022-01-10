import React from 'react';

import styled from 'styled-components/macro';

import { Illustration, IllustrationType } from 'components/illustration';
import { CenterLayout } from 'components/layouts/Center';
import { MediumTitle } from 'components/typography/MediumTitle';
import { StyledTypography } from 'components/typography/StyledTypography';
import { sizes } from 'styles/layout';

export const LOADING_TEXT = 'Loading results...';
export const NO_RESULTS_TEXT = 'No results available';

const SubTitleText = styled.span`
  transition: opacity 0.1s;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  padding-top: ${sizes.small};
  letter-spacing: 0em;
  color: var(--cogs-text-color-secondary);
`;
const SubtitleContainer = styled.div`
  align-items: center;
  justify-content: center;
`;

interface Props {
  loadingTitle?: string;
  loadingSubtitle?: string;
  img?: IllustrationType;
}

export const Loading: React.FC<Props> = ({
  loadingTitle = LOADING_TEXT,
  loadingSubtitle,
  img = 'Search',
}) => {
  return (
    <CenterLayout testid="loading-container">
      <Illustration type={img} />
      <MediumTitle>{loadingTitle}</MediumTitle>
      <StyledTypography>
        {loadingSubtitle && (
          <SubtitleContainer>
            <SubTitleText>{loadingSubtitle}</SubTitleText>
          </SubtitleContainer>
        )}
      </StyledTypography>
    </CenterLayout>
  );
};
