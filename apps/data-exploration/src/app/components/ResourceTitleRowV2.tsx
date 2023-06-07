import React from 'react';

import styled from 'styled-components';

import { Title } from '@cognite/cogs.js';
import { ResourceItem, ResourceIcons } from '@cognite/data-exploration';
import { DatapointsMultiQuery } from '@cognite/sdk';

import { BackInJourneyButton } from '../components/TitleRowActions/BackInJourneyButton';
import { useJourneyLength } from '../hooks/detailsNavigation';

import { TitleRowActionsV2 } from './TitleRowActions';

// Check for the exports from the original file!
// export type DateFilter = Pick<DatapointsMultiQuery, 'start' | 'end'>;
type DateFilter = Pick<DatapointsMultiQuery, 'start' | 'end'>;

type Props = {
  title?: string;
  item: ResourceItem;
  datefilter?: DateFilter;
  getTitle?: (_: any) => string | undefined;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
  hideDefaultCloseActions?: boolean;
};

export default function ResourceTitleRowV2({
  title,
  item: { type, id },
  datefilter,
  beforeDefaultActions,
  afterDefaultActions,
  hideDefaultCloseActions,
}: Props) {
  const [journeyLength] = useJourneyLength();

  const backButton = (
    <>
      <BackInJourneyButton />
      <Divider />
    </>
  );

  const name = (
    <NameWrapper>
      {journeyLength > 1 && backButton}
      <ResourceIcons
        type={type}
        style={{
          marginRight: '10px',
          backgroundColor:
            'var(--cogs-surface--status-neutral--muted--default)',
          color: 'var(--cogs-text-icon--status-neutral)',
        }}
      />
      <Name level="3">{title || id}</Name>
    </NameWrapper>
  );

  return (
    <TitleRowWrapper>
      <PreviewLinkWrapper>{name}</PreviewLinkWrapper>
      <StyledGoBackWrapper>
        <TitleRowActionsV2
          dateFilter={datefilter}
          item={{ type, id }}
          beforeDefaultActions={beforeDefaultActions}
          afterDefaultActions={afterDefaultActions}
          hideDefaultCloseActions={hideDefaultCloseActions}
        />
      </StyledGoBackWrapper>
    </TitleRowWrapper>
  );
}

const TitleRowWrapper = styled.div`
  h1 {
    margin: 0px;
  }
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 16px;
`;

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Name = styled(Title)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const StyledGoBackWrapper = styled.div`
  overflow: hidden;
  flex: 0 0 auto;
`;

const PreviewLinkWrapper = styled.div`
  overflow: hidden;
  vertical-align: bottom;
  flex: 1 1 auto;
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  margin: 0 8px;
  background-color: var(--cogs-border--muted);
`;
