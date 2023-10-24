import React from 'react';

import styled from 'styled-components';

import { CanvasButton } from '@fusion/industry-canvas';

import { ResourceItem } from '@data-exploration-lib/core';

import { useFlagIndustryCanvas } from '../../hooks/flags/useFlagIndustryCanvas';
import { DateFilter } from '../ResourceTitleRow';

import DownloadButton from './DownloadButton';
import { FullscreenButton } from './FullscreenButton';
import { PreviewCloseButton } from './PreviewCloseButton';

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
  const isIndustryCanvasEnabled = useFlagIndustryCanvas();

  if (item.type === 'threeD') {
    return <StyledSpace>{afterDefaultActions}</StyledSpace>;
  }

  return (
    <StyledSpace>
      {beforeDefaultActions}
      <DownloadButton item={item} dateFilter={dateFilter} />
      {isIndustryCanvasEnabled && <CanvasButton item={item} />}
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
