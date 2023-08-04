import React from 'react';

import styled from 'styled-components';

import { DateFilter } from '@data-exploration-app/components/ResourceTitleRow';
import CanvasButton from '@data-exploration-app/components/TitleRowActions/CanvasButton';
import { FullscreenButton } from '@data-exploration-app/components/TitleRowActions/FullscreenButton';
import { PreviewCloseButton } from '@data-exploration-app/components/TitleRowActions/PreviewCloseButton';
import { ResourceItem } from '@data-exploration-lib/core';

import DownloadButton from './DownloadButton';

type TitleRowActionsProps = {
  item: ResourceItem;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
  dateFilter?: DateFilter;
  hideDefaultCloseActions?: boolean;
};

export const TitleRowActions = ({
  item,
  dateFilter,
  afterDefaultActions,
  beforeDefaultActions,
  hideDefaultCloseActions,
}: TitleRowActionsProps) => {
  const activeId = item.id;

  if (item.type === 'threeD') {
    return <StyledSpace>{afterDefaultActions}</StyledSpace>;
  }

  return (
    <StyledSpace>
      {beforeDefaultActions}
      <DownloadButton item={item} dateFilter={dateFilter} />
      <CanvasButton item={item} />
      {afterDefaultActions}
      {!hideDefaultCloseActions && activeId && (
        <>
          <Divider />

          <FullscreenButton />
          <PreviewCloseButton />
        </>
      )}
    </StyledSpace>
  );
};

const StyledSpace = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  float: right;
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background-color: var(--cogs-border--muted);
`;
