import React, { PropsWithChildren, useRef } from 'react';

import styled, { css } from 'styled-components';

import { DASH } from '@fdx/shared/constants/common';
import { useIsOverflow } from '@fdx/shared/hooks/useIsOverflow';

import { Tooltip } from '@cognite/cogs.js';

interface Props extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
  strong?: boolean;
  capitalize?: boolean;
  fallback?: string;
}

/**
 * Two reasons of creating a typography component:
 * 1. We want to have a tooltip on overflow (Cogs.js doesn't support ref forwarding)
 * 2. Easier to maintain changes if we have a unified typography component
 */

const BodyTypography = ({
  children,
  fallback = DASH,
  ...rest
}: PropsWithChildren<Props>) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isOverflowing = useIsOverflow(ref);

  return (
    <Tooltip wrapped content={children || fallback} disabled={!isOverflowing}>
      <BodyWrapper {...rest} ref={ref}>
        {children || fallback}
      </BodyWrapper>
    </Tooltip>
  );
};

const TitleTypography = ({
  children,
  fallback = DASH,
  ...rest
}: PropsWithChildren<Props>) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isOverflowing = useIsOverflow(ref);

  return (
    <Tooltip wrapped content={children || fallback} disabled={!isOverflowing}>
      <TitleWrapper {...rest} ref={ref}>
        {children || fallback}
      </TitleWrapper>
    </Tooltip>
  );
};

export const Typography = () => null;
Typography.Body = BodyTypography;
Typography.Title = TitleTypography;

const BodyWrapper = styled.p<Props>`
  margin-bottom: 0;

  ${({ capitalize }) =>
    capitalize
      ? css`
          &:first-letter {
            text-transform: uppercase;
          }
        `
      : ''};

  overflow: hidden;
  font-feature-settings: 'ss04' on;
  text-overflow: ellipsis;
  white-space: nowrap;

  font-style: normal;
  font-weight: ${({ strong }) => (strong ? 500 : 400)};

  ${({ size }) => {
    if (size === 'xsmall') {
      return css`
        /* Body/XSmall */
        font-size: 12px;
        color: var(--text-icon-muted, rgba(0, 0, 0, 0.55));
        line-height: 24px; /* 138.462% */
        letter-spacing: -0.039px;
      `;
    }

    if (size === 'medium') {
      return css`
        /* Body/Medium */
        color: var(--text-icon-strong, rgba(0, 0, 0, 0.9));
        font-size: 14px;
        line-height: 20px; /* 142.857% */
        letter-spacing: -0.084px;
      `;
    }
  }};
`;

const TitleWrapper = styled.h1<Props>`
  margin-bottom: 0;

  white-space: nowrap;
  overflow: hidden;
  font-feature-settings: 'cv05' on;
  text-overflow: ellipsis;
  font-style: normal;
  color: var(--text-icon-strong, rgba(0, 0, 0, 0.9));
  font-weight: ${({ strong }) => (strong ? 700 : 600)};

  ${({ capitalize }) =>
    capitalize
      ? css`
          &:first-letter {
            text-transform: uppercase;
          }
        `
      : ''};

  ${({ size }) => {
    if (size === 'xsmall') {
      return css`
        /* Title/Heading 6 */
        font-size: 14px;
        font-weight: 600;
        line-height: 20px; /* 142.857% */
        letter-spacing: -0.084px;
      `;
    }

    if (size === 'small') {
      return css`
        /* Title/Heading 5 */
        font-size: 16px;
        font-weight: 600;
        line-height: 20px; /* 125% */
        letter-spacing: -0.176px;
      `;
    }
  }};
`;
