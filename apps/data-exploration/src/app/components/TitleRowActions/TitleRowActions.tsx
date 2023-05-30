import React from 'react';

import styled from 'styled-components';

import { ResourceItem } from '@cognite/data-exploration';

import { DateFilter } from '@data-exploration-app/components/ResourceTitleRow';
import CanvasButton from '@data-exploration-app/components/TitleRowActions/CanvasButton';
import { FullscreenButton } from '@data-exploration-app/components/TitleRowActions/FullscreenButton';
import { PreviewCloseButton } from '@data-exploration-app/components/TitleRowActions/PreviewCloseButton';
import { useCurrentResourceId } from '@data-exploration-app/hooks/hooks';

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
  const [activeId] = useCurrentResourceId();

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

          <FullscreenButton item={item} />
          <PreviewCloseButton item={item} />
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
