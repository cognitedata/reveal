import React, { useMemo } from 'react';

import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

export const ThreeDThumbnail = ({
  imageUrl,
  isLoading,
}: {
  imageUrl?: string;
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

  return <Thumbnail>{image}</Thumbnail>;
};

const Thumbnail = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 56px;
  min-width: 56px;
  height: 36px;
  border: 1px solid rgba(102, 102, 102, 0.2);
  border-radius: 6px;

  img {
    max-height: 100%;
    max-width: 100%;
  }

  svg {
    color: #0000008c;
  }
`;
