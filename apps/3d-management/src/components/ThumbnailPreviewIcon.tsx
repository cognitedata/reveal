import React from 'react';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

const EyeIcon = styled(Icon)`
  line-height: 0;
  transform: translateY(3px);
`;

export const ThumbnailPreviewIcon = (
  <div
    role="button"
    tabIndex={0}
    onClick={(e) => e.stopPropagation()}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
      }
    }}
  >
    <EyeIcon type="EyeShow" />
  </div>
);
