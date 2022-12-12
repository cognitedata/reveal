import React from 'react';
import { Colors, Title } from '@cognite/cogs.js';
import { ResourceItem, ResourceIcons } from '@cognite/data-exploration';
import { DatapointsMultiQuery } from '@cognite/sdk';
import styled from 'styled-components';
import { TitleRowActions } from './TitleRowActions';

export type DateFilter = Pick<DatapointsMultiQuery, 'start' | 'end'>;
type Props = {
  title?: string;
  item: ResourceItem;
  datefilter?: DateFilter;
  getTitle?: (_: any) => string | undefined;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
  hideDefaultCloseActions?: boolean;
};

export default function ResourceTitleRow({
  title,
  item: { type, id },
  datefilter,
  beforeDefaultActions,
  afterDefaultActions,
  hideDefaultCloseActions,
}: Props) {
  const name = (
    <NameWrapper>
      <ResourceIcons type={type} style={{ marginRight: '10px' }} />
      <Name level="3">{title || id}</Name>
    </NameWrapper>
  );

  return (
    <TitleRowWrapper>
      <PreviewLinkWrapper>{name}</PreviewLinkWrapper>
      <StyledGoBackWrapper>
        <TitleRowActions
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

export const TitleRowWrapper = styled.div`
  h1 {
    margin: 0px;
  }
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 16px;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
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
