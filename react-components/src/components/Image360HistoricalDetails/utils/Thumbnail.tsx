/*!
 * Copyright 2023 Cognite AS
 */

import styled from 'styled-components';
import { type ReactElement, useMemo } from 'react';
import { ImageOffIcon, LoaderIcon } from '@cognite/cogs.js';

export const Thumbnail = ({
  imageUrl,
  isActive,
  isLoading
}: {
  imageUrl?: string;
  isActive: boolean;
  isLoading: boolean;
}): ReactElement => {
  const image = useMemo(() => {
    if (imageUrl !== undefined) {
      return (
        <div>
          <img src={imageUrl} alt="thumbnail" />
        </div>
      );
    }

    if (isLoading) {
      return <LoaderIcon />;
    }

    return <ImageOffIcon />;
  }, [imageUrl, isLoading]);

  return <StyledThumbnail isActive={isActive}> {image} </StyledThumbnail>;
};

const StyledThumbnail = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 160px;
  min-width: 56px;
  height: 90px;
  border: 2px solid #d9d9d9;
  border-radius: 12px;
  gap: 6px;

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
