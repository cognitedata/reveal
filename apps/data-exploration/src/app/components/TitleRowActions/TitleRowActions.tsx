import React from 'react';
import { ResourceItem } from '@cognite/data-exploration';
import styled from 'styled-components';

import { DateFilter } from '@data-exploration-app/components/ResourceTitleRow';
import { useCurrentResourceId } from '@data-exploration-app/hooks/hooks';
import DownloadButton from './DownloadButton';
import { MoreButton } from './MoreButton';
import { PreviewCloseButton } from '@data-exploration-app/components/TitleRowActions/PreviewCloseButton';
import { FullscreenButton } from '@data-exploration-app/components/TitleRowActions/FullscreenButton';

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
      <MoreButton item={item} />
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
