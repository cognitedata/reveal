/*!
 * Copyright 2023 Cognite AS
 */

import styled from 'styled-components';
import React, { useMemo } from 'react';
import { Icon } from '@cognite/cogs.js';

export const Thumbnail = ({
  imageUrl,
  isActive,
  isLoading,
}: {
  imageUrl?: string;
  isActive: boolean;
  isLoading: boolean;
}) => {
  const image = useMemo(() => {
    if (imageUrl) {
      return (
        <div>
          <img src={imageUrl} alt="thumbnail" />
        </div>
      );
    }

    if (isLoading) {
      return <Icon type="Loader" />;
    }

    return <Icon type="ImageOff" />;
  }, [imageUrl, isLoading]);

  return <StyledThumbnail
            isActive={isActive}
          >
            {image}
          </StyledThumbnail>;
};

const StyledThumbnail = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 160px;
  min-width: 56px;
  height: 112px;
  border: 1px solid #D9D9D9;
  border-radius: 12px;

  img {
    max-height: 100%;
    max-width: 100%;
  }

  svg {
    color: #0000008c;
  }

  ${({ isActive }) =>
    isActive &&
    `
    border: 4px solid #4A67FB;
  `}
`;
