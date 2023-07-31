import * as React from 'react';

import styled from 'styled-components/macro';

import { Illustration, IllustrationType } from 'components/Illustration';
import { CenterLayout } from 'components/Layouts/Center';
import { MediumTitle } from 'components/Typography/MediumTitle';
import { StyledTypography } from 'components/Typography/StyledTypography';
import { sizes } from 'styles/layout';

import { LOADING_TEXT } from './constants';

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
